"""Advisory request schema (PRD F8)."""

from typing import Literal

from pydantic import BaseModel, Field


class AdvisoryRequest(BaseModel):
    location: str = Field(min_length=2, max_length=120)
    crop: str = Field(min_length=2, max_length=40)
    season: Literal["Kharif", "Rabi", "Zaid"]
    soil_type: str = Field(min_length=2, max_length=40)
    irrigation: str = Field(min_length=2, max_length=60)

    temperature_c: float | None = Field(default=None, ge=-30, le=60)
    humidity_pct: float | None = Field(default=None, ge=0, le=100)
    rainfall_mm_7d: float | None = Field(default=None, ge=0, le=2000)

    ndvi: float | None = Field(default=None, ge=-1, le=1)
    vegetation_status: str | None = Field(default=None, max_length=60)
    satellite_source: str | None = Field(default=None, max_length=60)

    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_score: int = Field(ge=0, le=100)
    risk_assumptions: list[str] = Field(default_factory=list, max_length=10)

    language: Literal["en", "hi", "gu", "te"] = "en"
