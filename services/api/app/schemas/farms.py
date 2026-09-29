"""Farm request schemas (PRD F1)."""

from typing import Literal

from pydantic import BaseModel, Field

from app.models.documents import GeoPoint, SoilProfile


class FarmCreate(BaseModel):
    farmer_id: str = Field(min_length=1, max_length=64)
    location: GeoPoint
    state: str = Field(min_length=2, max_length=60)
    district: str = Field(min_length=2, max_length=60)
    area_acres: float = Field(gt=0, le=10_000)
    crop: str = Field(min_length=2, max_length=40)
    season: Literal["Kharif", "Rabi", "Zaid"]
    soil: SoilProfile
    irrigation: str = Field(min_length=2, max_length=60)
    is_demo: bool = False


class FarmUpdate(BaseModel):
    location: GeoPoint | None = None
    state: str | None = Field(default=None, min_length=2, max_length=60)
    district: str | None = Field(default=None, min_length=2, max_length=60)
    area_acres: float | None = Field(default=None, gt=0, le=10_000)
    crop: str | None = Field(default=None, min_length=2, max_length=40)
    season: Literal["Kharif", "Rabi", "Zaid"] | None = None
    soil: SoilProfile | None = None
    irrigation: str | None = Field(default=None, min_length=2, max_length=60)
