"""AgriMitra Climate — leaf disease inference service.

Pipeline:

    upload -> validate -> orient + downscale -> leaf detection
           -> MobileNetV2 -> confident? -> return
                          -> uncertain -> Gemini multimodal -> return

Two properties this service has to hold:

* **It must not refuse diseased leaves.** See ``app/vision/leaf.py`` — the colour
  gate used to be green-only, which rejected every disease it exists to identify.
* **It must not block the event loop.** Torch inference and the Gemini call are
  both synchronous and slow. Run on the loop thread they serialise every
  concurrent request behind them; a second farmer waits for the first one's
  model run to finish.
"""

import asyncio
import json
import logging
import time
from contextlib import asynccontextmanager
from io import BytesIO

import anyio
import structlog
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from PIL import Image, UnidentifiedImageError
from transformers import (
    AutoModelForImageClassification,
    MobileNetV2ImageProcessor,
    pipeline,
)

from .core.config import settings
from .vision.leaf import prepare

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
)
logging.basicConfig(format="%(message)s", level=logging.INFO)
logger = structlog.get_logger(__name__)

CLASSIFIER = None
MODEL_ID = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Below this the classifier's answer is not trusted on its own and Gemini is asked.
CONFIDENCE_THRESHOLD = 0.70
# Hard ceiling on the Gemini call so one slow request cannot hold a farmer's
# scan open indefinitely.
GEMINI_TIMEOUT_SECONDS = 25.0

# Guidance is monitoring-first. PRD §19 forbids unsupported chemical advice, so
# no dosage is given and no product is prescribed — the farmer is pointed at the
# local extension officer, who can legally advise.
GUIDANCE = {
    "healthy": (
        "No disease signs detected. Keep monitoring after rain and irrigation, "
        "when most infections take hold."
    ),
    "blight": (
        "Watch for spreading dark patches and leaf drop, especially in humid or "
        "wet weather. Remove and destroy affected leaves. Ask your local "
        "agricultural extension officer which treatment is approved for your crop."
    ),
    "rust": (
        "Look for the pustules spreading to new leaves. Avoid overhead watering, "
        "which moves spores. Confirm the treatment with your extension officer."
    ),
    "scab": (
        "Remove fallen leaves, which carry the infection to next season. Ask your "
        "extension officer about approved control for your variety."
    ),
    "spot": (
        "Track whether the spots enlarge or multiply over the next week. Keep the "
        "canopy dry where you can, and confirm treatment locally."
    ),
    "mildew": (
        "Improve airflow between plants and avoid wetting foliage. Ask your "
        "extension officer which control is approved locally."
    ),
    "virus": (
        "Viral symptoms cannot be cured by spraying. Remove affected plants and "
        "control the insects that spread them. Seek extension advice promptly."
    ),
    "default": (
        "Photograph the same leaf again in two or three days to see whether it is "
        "spreading, and show this result to your local agricultural extension officer."
    ),
}


def guidance_for(label: str) -> str:
    normalized = label.lower().replace("_", " ")
    if "healthy" in normalized:
        return GUIDANCE["healthy"]
    for key, text in GUIDANCE.items():
        if key not in ("healthy", "default") and key in normalized:
            return text
    return GUIDANCE["default"]


def pretty(label: str) -> str:
    """Normalise a class name for display.

    This checkpoint emits readable labels ("Apple Scab", "Healthy Apple"), but
    other PlantVillage-derived checkpoints use `Tomato___Early_blight`. Handle
    both so swapping the model does not leak underscores into the UI.
    """
    crop, _, disease = label.partition("___")
    crop = crop.replace("_", " ").strip()
    disease = disease.replace("_", " ").strip()
    return f"{crop} — {disease}" if disease else crop


@asynccontextmanager
async def lifespan(app: FastAPI):
    global CLASSIFIER
    started = time.perf_counter()
    try:
        logger.info("model_loading", model_id=MODEL_ID)

        def _load():
            # The processor is constructed explicitly. This checkpoint's
            # preprocessor_config.json has no `image_processor_type`, and current
            # transformers no longer infers it, so `pipeline(model=MODEL_ID)`
            # raises "Unrecognized image processor". That failure was swallowed
            # into CLASSIFIER = None, and every scan then fell through to a
            # Gemini path that is unconfigured by default — so the disease
            # scanner returned "uncertain" for every photo, silently.
            processor = MobileNetV2ImageProcessor.from_pretrained(MODEL_ID)
            model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
            return pipeline("image-classification", model=model, image_processor=processor)

        # Loading pulls weights and builds the graph — seconds to minutes on a
        # cold container. Off-thread so the health endpoint answers meanwhile.
        CLASSIFIER = await anyio.to_thread.run_sync(_load)
        logger.info("model_loaded", seconds=round(time.perf_counter() - started, 1))
    except Exception as exc:
        logger.error("model_load_failed", error=str(exc))
        CLASSIFIER = None
    yield


app = FastAPI(title="AgriMitra Inference", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
async def health() -> dict:
    """Readiness, not just liveness: a container whose model failed to load must
    report it rather than accepting traffic it cannot serve well."""
    return {
        "status": "ok" if CLASSIFIER is not None else "degraded",
        "model_loaded": CLASSIFIER is not None,
        "model_id": MODEL_ID,
        "gemini_fallback": bool(settings.gemini_api_key),
    }


async def analyze_with_gemini(pil_img: Image.Image) -> dict:
    if not settings.gemini_api_key or settings.gemini_api_key in (
        "your_gemini_api_key",
        "your_gemini_api_key_here",
    ):
        return {
            "label": "uncertain",
            "confidence": None,
            "guidance": (
                "The image model was not confident enough to name a disease, and the "
                "second-opinion model is not configured on this server. Try a closer, "
                "well-lit photo of a single affected leaf."
            ),
            "source": "unavailable",
        }

    prompt = (
        "You are examining a crop leaf photograph for an Indian smallholder farmer. "
        "Respond with JSON: 'label' (the most likely disease, or 'healthy', or "
        "'uncertain' if you genuinely cannot tell), 'confidence' (0-1, and be "
        "honest — a low number is more useful than a confident guess), and "
        "'guidance' (what to monitor over the next week). Do not name any "
        "pesticide, fungicide or dosage; direct the farmer to their local "
        "agricultural extension officer for treatment."
    )

    def _call() -> dict:
        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, pil_img],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        return json.loads(response.text)

    try:
        data = await asyncio.wait_for(
            anyio.to_thread.run_sync(_call), timeout=GEMINI_TIMEOUT_SECONDS
        )
    except TimeoutError:
        logger.warning("gemini_timeout", seconds=GEMINI_TIMEOUT_SECONDS)
        return {
            "label": "uncertain",
            "confidence": None,
            "guidance": "The second-opinion model did not respond in time. Try again.",
            "source": "unavailable",
        }
    except Exception as exc:
        logger.error("gemini_failed", error=str(exc))
        return {
            "label": "uncertain",
            "confidence": None,
            "guidance": (
                "A second opinion could not be obtained. Photograph the same leaf "
                "again in a few days and show it to your extension officer."
            ),
            "source": "unavailable",
        }

    confidence = data.get("confidence")
    return {
        "label": str(data.get("label", "uncertain")),
        "confidence": float(confidence) if isinstance(confidence, int | float) else None,
        "guidance": data.get("guidance") or GUIDANCE["default"],
        "source": "gemini-vision",
    }


@app.post("/v1/predict")
async def predict(file: UploadFile = File(...)) -> dict:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Unsupported file type: {file.content_type}. "
            f"Allowed: {', '.join(sorted(ALLOWED_MIME_TYPES))}.",
        )

    # Read one byte past the cap so an oversized upload is refused without
    # buffering all of it.
    contents = await file.read(MAX_FILE_SIZE + 1)
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"Image is larger than {MAX_FILE_SIZE // (1024 * 1024)}MB.",
        )
    if not contents:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The uploaded image is empty.")

    started = time.perf_counter()

    try:
        pil_img = Image.open(BytesIO(contents))
        pil_img.load()
    except (UnidentifiedImageError, OSError) as exc:
        # A corrupt or truncated file is the caller's problem, not a 500.
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "That file could not be read as an image."
        ) from exc
    except Image.DecompressionBombError as exc:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Image resolution is too large."
        ) from exc

    # Orientation, downscale and leaf detection are all CPU-bound OpenCV work.
    frame = await anyio.to_thread.run_sync(prepare, pil_img)

    if not frame.is_leaf:
        logger.info("rejected_not_leaf", reason=frame.reason, leaf_ratio=frame.leaf_ratio)
        return {
            "label": "not_a_plant",
            "confidence": None,
            "guidance": (
                "No leaf was found in this photo. Fill the frame with a single leaf, "
                "in daylight, against a plain background."
            ),
            "source": "leaf-detector",
            "detail": frame.reason,
            "elapsed_ms": int((time.perf_counter() - started) * 1000),
        }

    if CLASSIFIER is None:
        result = await analyze_with_gemini(frame.image)
        result["elapsed_ms"] = int((time.perf_counter() - started) * 1000)
        return result

    try:
        # Torch inference is synchronous and CPU-bound. On the loop thread it
        # serialises every other request behind it.
        predictions = await anyio.to_thread.run_sync(
            lambda: CLASSIFIER(frame.image, top_k=3)
        )
    except Exception as exc:
        logger.error("inference_failed", error=str(exc))
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "The image model could not process this photo. Please try again.",
        ) from exc

    if not predictions:
        result = await analyze_with_gemini(frame.image)
        result["elapsed_ms"] = int((time.perf_counter() - started) * 1000)
        return result

    top = predictions[0]
    confidence = float(top["score"])

    if confidence < CONFIDENCE_THRESHOLD:
        logger.info("low_confidence_escalated", confidence=confidence, label=top["label"])
        result = await analyze_with_gemini(frame.image)
        result["elapsed_ms"] = int((time.perf_counter() - started) * 1000)
        result["classifier_best_guess"] = pretty(top["label"])
        result["classifier_confidence"] = confidence
        return result

    elapsed_ms = int((time.perf_counter() - started) * 1000)
    logger.info("predicted", label=top["label"], confidence=confidence, elapsed_ms=elapsed_ms)

    return {
        "label": pretty(top["label"]),
        "raw_label": top["label"],
        "confidence": confidence,
        # The runners-up let the UI show what else it might be, which matters
        # when two diseases look alike.
        "alternatives": [
            {"label": pretty(p["label"]), "confidence": round(float(p["score"]), 4)}
            for p in predictions[1:]
        ],
        "guidance": guidance_for(top["label"]),
        "source": "mobilenet-v2",
        "leaf_ratio": round(frame.leaf_ratio, 3),
        "elapsed_ms": elapsed_ms,
    }


if __name__ == "__main__":
    # Binds all interfaces because the service runs inside a container and is
    # reached by the API service, never exposed publicly. S104 is expected here.
    uvicorn.run(app, host="0.0.0.0", port=8001)  # noqa: S104
