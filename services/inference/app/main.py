import json
import logging
from io import BytesIO

import cv2
import numpy as np
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from PIL import Image
from transformers import pipeline

from .core.config import settings

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = FastAPI()

# Enable CORS with restricted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASSIFIER = None
MODEL_ID = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

def auto_crop_image(pil_img: Image.Image) -> tuple[Image.Image, bool]:
    """Intelligently slices off excessive background noise around a dominant leaf using HSV color bounding and contours."""
    try:
        open_cv_image = np.array(pil_img)
        img = open_cv_image[:, :, ::-1].copy()
        
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        lower_bound = np.array([20, 20, 20])
        upper_bound = np.array([100, 255, 255])
        
        mask = cv2.inRange(hsv, lower_bound, upper_bound)
        
        total_pixels = open_cv_image.shape[0] * open_cv_image.shape[1]
        plant_pixels = cv2.countNonZero(mask)
        plant_ratio = plant_pixels / total_pixels
        
        if plant_ratio < 0.02:
            logging.warning(f"Rejection: Low plant pixel ratio detected ({plant_ratio:.2%})")
            return (pil_img, False)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return (pil_img, False)

        largest_contour = max(contours, key=cv2.contourArea)
        
        if cv2.contourArea(largest_contour) < 500:
            return (pil_img, False)
            
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        cropped = img[max(0, y-20):y+h+20, max(0, x-20):x+w+20]
        
        cropped_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
        return (Image.fromarray(cropped_rgb), True)
        
    except Exception as e:
        logging.warning(f"Auto-crop failed, falling back to original image: {e}")
        return (pil_img, True)

@app.on_event("startup")
async def startup_event():
    global CLASSIFIER
    try:
        logging.info(f"Loading Hugging Face model: {MODEL_ID}")
        CLASSIFIER = pipeline("image-classification", model=MODEL_ID)
        logging.info("✅ Model loaded successfully!")
    except Exception as e:
        logging.error(f"Failed to load model: {e}")
        CLASSIFIER = None

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": CLASSIFIER is not None}

async def analyze_with_gemini(pil_img: Image.Image) -> dict:
    if not settings.gemini_api_key or settings.gemini_api_key in ("your_gemini_api_key", "your_gemini_api_key_here"):
        return {
            "label": "Unknown",
            "confidence": 0.0,
            "guidance": "Unable to verify. Gemini API key missing.",
            "source": "unavailable"
        }
    
    try:
        client = genai.Client(api_key=settings.gemini_api_key)
        
        prompt = "Identify the plant disease in this image. Respond with a JSON object containing 'label' (string), 'confidence' (number 0-1), and 'guidance' (string for treatment)."
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, pil_img],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        data = json.loads(response.text)
        return {
            "label": data.get("label", "Unknown"),
            "confidence": float(data.get("confidence", 0.0)),
            "guidance": data.get("guidance", "Consult an expert."),
            "source": "gemini-vision"
        }
    except Exception as e:
        logging.error(f"Gemini fallback failed: {e}")
        return {
            "label": "Error",
            "confidence": 0.0,
            "guidance": "Gemini fallback failed.",
            "source": "unavailable"
        }

@app.post("/v1/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
        )
        
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024)} MB."
        )

    try:
        pil_img = Image.open(BytesIO(contents)).convert("RGB")
        
        cropped_img, is_plant = auto_crop_image(pil_img)
        
        if not is_plant:
            return {
                "label": "not_a_plant",
                "confidence": None,
                "guidance": "Please upload a clear image of a plant leaf.",
                "source": "unavailable"
            }

        if CLASSIFIER is not None:
            predictions = CLASSIFIER(cropped_img)
            top_prediction = predictions[0]
            confidence = top_prediction["score"]
            predicted_label = top_prediction["label"]
            
            if confidence >= 0.70:
                recommendations = {
                    "healthy": "Your crop looks healthy! Keep up the good work.",
                    "Early_blight": "Apply fungicides like Mancozeb or Chlorothalonil.",
                    "Apple_scab": "Apply fungicides and remove fallen leaves.",
                    "Common_rust_": "Apply fungicides early and plant resistant varieties.",
                    "default": "Consult an expert for detailed advice."
                }
                
                rec_text = recommendations.get("default")
                for key, value in recommendations.items():
                    if key in predicted_label:
                        rec_text = value
                        break
                        
                return {
                    "label": predicted_label.replace("_", " "),
                    "confidence": float(confidence),
                    "guidance": rec_text,
                    "source": "mobilenet-v2"
                }
        
        # Fallback to Gemini
        gemini_result = await analyze_with_gemini(cropped_img)
        return gemini_result
        
    except Exception as e:
        logging.error(f"Prediction error: {e}")
        return {
            "label": "Error",
            "confidence": 0.0,
            "guidance": f"An error occurred: {e!s}",
            "source": "unavailable"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
