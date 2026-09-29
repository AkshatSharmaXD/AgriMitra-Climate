"""Leaf diagnosis proxy (PRD F9, §18, §19).

Enforces upload validation the previous Express route lacked: declared MIME type,
real byte-size cap read from the stream, and a decodable-image check delegated to
the inference service. The result is persisted against the farm so the risk engine
sees a real observation instead of its neutral baseline.
"""

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import get_settings
from app.core.database import is_connected
from app.integrations.storage import StorageUnavailable, store_leaf_image
from app.models.documents import DiseaseAnalysis

router = APIRouter()
settings = get_settings()

HEDGE = (
    "This is a possible identification from an image model, not a confirmed diagnosis. "
    "Confirm with your local agricultural extension officer before applying any treatment."
)


@router.post("")
async def analyze_leaf(
    image: UploadFile = File(...),
    farm_id: str | None = Form(default=None),
    crop: str | None = Form(default=None),
) -> dict:
    if image.content_type not in settings.allowed_image_types:
        raise HTTPException(
            415,
            f"Unsupported image type '{image.content_type}'. "
            f"Allowed: {', '.join(sorted(settings.allowed_image_types))}.",
        )

    payload = await image.read(settings.max_upload_bytes + 1)
    if len(payload) > settings.max_upload_bytes:
        raise HTTPException(
            413, f"Image exceeds the {settings.max_upload_bytes // (1024 * 1024)}MB limit."
        )
    if not payload:
        raise HTTPException(400, "Uploaded image is empty.")

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=5.0)) as client:
            response = await client.post(
                f"{settings.inference_service_url}/v1/predict",
                files={"file": (image.filename, payload, image.content_type)},
            )
            response.raise_for_status()
            result = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(503, "Diagnosis service is unavailable right now.") from exc

    # Keep the photograph. Without it an officer reviewing a flagged farm cannot
    # see what the model actually looked at, and a wrong call cannot be audited.
    # An upload failure never fails the farmer's scan.
    image_ref: str | None = None
    try:
        image_ref = await store_leaf_image(payload, image.content_type, farm_id)
    except StorageUnavailable:
        image_ref = None

    # The prediction itself needs no database. Persisting it against a farm does,
    # so a database outage costs the farmer the record, not the diagnosis.
    stored = False
    if farm_id and result.get("label") and is_connected():
        stored = True
        await DiseaseAnalysis(
            farm_id=farm_id,
            crop=crop,
            label=result["label"],
            confidence=float(result.get("confidence", 0.0)),
            recommendation=result.get("guidance"),
            source=result.get("source", "inference"),
            image_ref=image_ref,
        ).insert()

    return {
        **result,
        "stored": stored,
        "image_stored": image_ref is not None,
        "disclaimer": HEDGE,
    }
