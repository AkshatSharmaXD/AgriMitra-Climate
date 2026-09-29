"""Seed the demo dataset (PRD §17).

10 districts · 100 farms · 10 crops · soil profiles · satellite snapshots · risks.

Idempotent and safe: it clears **only** documents marked ``is_demo=True``, so running
it against a database that also holds real farms leaves those untouched. The previous
script deleted entire collections and then crashed on a schema violation before it
finished (audit B6, B8).

    python -m scripts.seed
"""

from __future__ import annotations

import argparse
import asyncio
import random
from datetime import UTC, datetime, timedelta

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings
from app.domain.risk import RiskInputs, compute_risk
from app.integrations.satellite import SeededDemoProvider
from app.models.documents import (
    DOCUMENT_MODELS,
    DiseaseAnalysis,
    Farm,
    Farmer,
    FarmRisk,
    GeoPoint,
    SatelliteSnapshot,
    SoilProfile,
)

SEED = 20260929  # fixed, so the demo is identical on every judge's machine
FARM_COUNT = 100

DISTRICTS = [
    ("Alwar", 27.55, 76.63),
    ("Jaipur", 26.91, 75.78),
    ("Jodhpur", 26.23, 73.02),
    ("Udaipur", 24.58, 73.68),
    ("Bikaner", 28.02, 73.31),
    ("Ajmer", 26.44, 74.63),
    ("Kota", 25.18, 75.83),
    ("Bhilwara", 25.32, 74.58),
    ("Sikar", 27.60, 75.13),
    ("Pali", 25.77, 73.33),
]

CROPS = [
    "Wheat", "Mustard", "Chickpea", "Barley", "Millet",
    "Maize", "Rice", "Cotton", "Groundnut", "Sorghum",
]
SOILS = ["Loamy", "Clay Loam", "Sandy Loam", "Sandy", "Clay"]
LEVELS = ["Low", "Medium", "High"]
IRRIGATION = ["Well irrigated", "Limited irrigation", "Rainfed", "Good irrigation"]

# Plausible district-level conditions for the demo. These drive the *seeded* risk
# values only; a live request recomputes risk from the real weather API.
DISTRICT_CONDITIONS = {
    "Alwar": (31.0, 42.0), "Jaipur": (33.0, 28.0), "Jodhpur": (38.0, 9.0),
    "Udaipur": (29.0, 68.0), "Bikaner": (40.0, 4.0), "Ajmer": (34.0, 24.0),
    "Kota": (30.0, 74.0), "Bhilwara": (32.0, 46.0), "Sikar": (35.0, 18.0),
    "Pali": (36.0, 14.0),
}

DEMO_DISEASES = [
    ("Wheat___Leaf_Rust", 0.88),
    ("Mustard___Alternaria_Blight", 0.81),
    ("Tomato___Early_blight", 0.92),
    ("healthy", 0.94),
    ("healthy", 0.87),
]


async def clear_demo_data() -> None:
    """Remove only what this script created."""
    for model in (DiseaseAnalysis, FarmRisk, SatelliteSnapshot, Farm, Farmer):
        result = await model.find(model.is_demo == True).delete()  # noqa: E712
        print(f"  cleared {result.deleted_count if result else 0:>4} from {model.Settings.name}")


async def seed() -> None:
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
    await init_beanie(database=client[settings.mongodb_db], document_models=DOCUMENT_MODELS)

    # Never print the raw URI: it carries the cluster password, and this
    # output lands in terminal scrollback and CI logs.
    print(f"Seeding {settings.mongodb_db} at {_redact(settings.mongodb_uri)}")
    print("Clearing previous demo data...")
    await clear_demo_data()

    rng = random.Random(SEED)
    ndvi_provider = SeededDemoProvider()
    now = datetime.now(UTC)

    created = {"farmers": 0, "farms": 0, "risks": 0, "snapshots": 0, "diagnoses": 0}

    for index in range(FARM_COUNT):
        district, base_lat, base_lng = DISTRICTS[index % len(DISTRICTS)]
        # Farm 0 is the demo persona from PRD §7.1, used in the pitch walkthrough.
        hero = index == 0

        farmer = Farmer(
            name="Ravi Kumar" if hero else f"Demo Farmer {index:03d}",
            phone=f"+9199999{index:05d}",
            language="hi" if hero else rng.choice(["en", "hi", "gu"]),
            is_demo=True,
        )
        await farmer.insert()
        created["farmers"] += 1

        farm = Farm(
            farmer_id=str(farmer.id),
            location=GeoPoint(
                lat=base_lat if hero else round(base_lat + rng.uniform(-0.05, 0.05), 4),
                lng=base_lng if hero else round(base_lng + rng.uniform(-0.05, 0.05), 4),
            ),
            state="Rajasthan",
            district=district,
            area_acres=2.0 if hero else float(rng.randint(1, 8)),
            crop="Wheat" if hero else rng.choice(CROPS),
            season="Rabi",
            soil=SoilProfile(
                type="Loamy" if hero else rng.choice(SOILS),
                moisture="Low" if hero else rng.choice([*LEVELS, None]),
                nitrogen=rng.choice([*LEVELS, None]),
                phosphorus=rng.choice([*LEVELS, None]),
                potassium=rng.choice([*LEVELS, None]),
            ),
            irrigation="Limited irrigation" if hero else rng.choice(IRRIGATION),
            is_demo=True,
        )
        await farm.insert()
        created["farms"] += 1

        ndvi_record = await ndvi_provider.get_ndvi(farm.location.lat, farm.location.lng, district)
        snapshot = SatelliteSnapshot(farm_id=str(farm.id), **ndvi_record, is_demo=True)
        await snapshot.insert()
        created["snapshots"] += 1

        # Every fifth farm carries a leaf scan, so district disease counts are
        # non-empty without implying every farm was inspected.
        label: str | None = None
        confidence: float | None = None
        if index % 5 == 0:
            label, confidence = DEMO_DISEASES[(index // 5) % len(DEMO_DISEASES)]
            await DiseaseAnalysis(
                farm_id=str(farm.id),
                crop=farm.crop,
                label=label,
                confidence=confidence,
                recommendation="Demo record — monitor and confirm with an extension officer.",
                source="seeded-demo",
                analyzed_at=now - timedelta(days=rng.randint(1, 14)),
                is_demo=True,
            ).insert()
            created["diagnoses"] += 1

        temperature, rainfall_7d = DISTRICT_CONDITIONS[district]
        result = compute_risk(
            RiskInputs(
                irrigation=farm.irrigation,
                soil_moisture=farm.soil.moisture,
                temperature_c=temperature + rng.uniform(-1.5, 1.5),
                rainfall_mm_7d=rainfall_7d,
                ndvi=snapshot.ndvi,
                disease_label=label,
                disease_confidence=confidence,
            )
        )
        await FarmRisk(
            farm_id=str(farm.id),
            water_stress=result.water_stress,
            heat_stress=result.heat_stress,
            rainfall_risk=result.rainfall_risk,
            disease_risk=result.disease_risk,
            vegetation_risk=result.vegetation_risk,
            overall_score=result.overall_score,
            level=result.level,
            weights=result.weights,
            assumptions=result.assumptions,
            is_demo=True,
        ).insert()
        created["risks"] += 1

    print("\nSeed complete:")
    for key, value in created.items():
        print(f"  {value:>4} {key}")
    print(
        "\nEvery document is marked is_demo=True. The UI renders a "
        "'Demo dataset' badge for these records."
    )
    client.close()


def _redact(uri: str) -> str:
    """Hide the password before printing an Atlas connection string."""
    if "@" not in uri:
        return uri
    scheme, _, rest = uri.partition("://")
    credentials, _, host = rest.rpartition("@")
    user = credentials.split(":", 1)[0] if credentials else ""
    return f"{scheme}://{user}:***@{host}"


def confirm_remote_target(assume_yes: bool) -> bool:
    """Atlas is a shared, hosted cluster.

    Deleting documents there is not the same as deleting them from a throwaway
    local mongod. The clear is already scoped to is_demo records, but a mistyped
    MONGODB_URI pointing at the wrong cluster should never be silent.
    """
    settings = get_settings()
    if not settings.mongodb_is_remote or assume_yes:
        return True

    print(f"Target is a remote cluster: {_redact(settings.mongodb_uri)}")
    print(f"Database: {settings.mongodb_db}")
    print("This deletes every document marked is_demo=True and reseeds them.")
    if input("Type the database name to continue: ").strip() != settings.mongodb_db:
        print("Aborted. Nothing was changed.")
        return False
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the AgriMitra demo dataset.")
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Skip the confirmation prompt for a remote cluster (for CI).",
    )
    if confirm_remote_target(parser.parse_args().yes):
        asyncio.run(seed())
