"""Crop suitability endpoints (PRD F6)."""

from dataclasses import asdict

from fastapi import APIRouter

from app.domain.suitability import FarmContext, rank_crops
from app.schemas.recommendations import CropRecommendationRequest

router = APIRouter()

DISCLAIMER = (
    "Suitability scores are decision support built from prototype assumptions. "
    "They are not validated agronomic advice and not a guarantee of yield."
)


@router.post("/crops")
async def recommend_crops(payload: CropRecommendationRequest) -> dict:
    ranked = rank_crops(
        FarmContext(
            season=payload.season,
            soil_type=payload.soil_type,
            irrigation=payload.irrigation,
            temperature_c=payload.temperature_c,
            seasonal_rainfall_mm=payload.seasonal_rainfall_mm,
        )
    )
    return {
        "recommendations": [asdict(item) for item in ranked],
        "disclaimer": DISCLAIMER,
    }
