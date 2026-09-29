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
