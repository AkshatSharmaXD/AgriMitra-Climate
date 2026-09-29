"""Request/response schemas for crop suitability."""

from typing import Literal

from pydantic import BaseModel, Field


class CropRecommendationRequest(BaseModel):
    season: Literal["Kharif", "Rabi", "Zaid"]
    soil_type: str = Field(min_length=2, max_length=40)
    irrigation: str = Field(min_length=2, max_length=60)
    temperature_c: float | None = Field(default=None, ge=-30, le=60)
    # Millimetres accumulated over a growing season — never an hourly reading.
    seasonal_rainfall_mm: float | None = Field(default=None, ge=0, le=6000)


class CropExplainRequest(CropRecommendationRequest):
    """Adds the narration context. The ranking itself is still computed locally."""

    location: str = Field(min_length=2, max_length=120)
    language: Literal["en", "hi", "gu", "te"] = "en"
    limit: int = Field(default=5, ge=1, le=10)
