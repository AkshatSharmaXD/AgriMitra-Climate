"""Mongo documents (PRD §15).

``is_demo`` exists on every seeded collection so the seed script can clear exactly
what it created, and so the UI can render a "Demo dataset" badge truthfully.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal

import pymongo
from beanie import Document, Indexed
from pydantic import BaseModel, Field

Season = Literal["Kharif", "Rabi", "Zaid"]
RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
Language = Literal["en", "hi", "gu", "te"]


def _now() -> datetime:
    return datetime.now(UTC)


class GeoPoint(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class SoilProfile(BaseModel):
    """Manual entry only (PRD F4). Gemini must never populate these."""

    type: str
    moisture: Literal["Low", "Medium", "High"] | None = None
    nitrogen: Literal["Low", "Medium", "High"] | None = None
    phosphorus: Literal["Low", "Medium", "High"] | None = None
    potassium: Literal["Low", "Medium", "High"] | None = None


class Farmer(Document):
    name: str
    phone: str
    language: Language = "en"
    is_demo: bool = False
    created_at: datetime = Field(default_factory=_now)

    class Settings:
        name = "farmers"


class Farm(Document):
    farmer_id: Indexed(str)  # type: ignore[valid-type]
    location: GeoPoint
    state: str
    district: Indexed(str)  # type: ignore[valid-type]
    area_acres: float = Field(gt=0)
    crop: str
    season: Season
    soil: SoilProfile
    irrigation: str
    is_demo: bool = False
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)

    class Settings:
        name = "farms"


class FarmRisk(Document):
    farm_id: Indexed(str)  # type: ignore[valid-type]
    water_stress: float
    heat_stress: float
    rainfall_risk: float
    disease_risk: float
    vegetation_risk: float
    overall_score: int
    level: RiskLevel
    weights: dict[str, float]
    assumptions: list[str] = Field(default_factory=list)
    is_demo: bool = False
    computed_at: datetime = Field(default_factory=_now)

    class Settings:
        name = "farm_risks"
        indexes = [[("farm_id", pymongo.ASCENDING), ("computed_at", pymongo.DESCENDING)]]


class SatelliteSnapshot(Document):
    farm_id: Indexed(str)  # type: ignore[valid-type]
    ndvi: float
    vegetation_health: float
    vegetation_status: str
    captured_on: str
    source: str
    is_live: bool
    is_demo: bool = False
    created_at: datetime = Field(default_factory=_now)

    class Settings:
        name = "satellite_snapshots"


class DiseaseAnalysis(Document):
    farm_id: Indexed(str) | None = None  # type: ignore[valid-type]
    crop: str | None = None
    label: str
    confidence: float = Field(ge=0, le=1)
    recommendation: str | None = None
    source: str
    image_ref: str | None = None
    is_demo: bool = False
    analyzed_at: datetime = Field(default_factory=_now)

    class Settings:
        name = "disease_analyses"
        indexes = [[("farm_id", pymongo.ASCENDING), ("analyzed_at", pymongo.DESCENDING)]]


DOCUMENT_MODELS = [Farmer, Farm, FarmRisk, SatelliteSnapshot, DiseaseAnalysis]
