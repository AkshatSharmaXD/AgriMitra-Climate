"""Farm profile and farm risk endpoints (PRD F1, F5)."""

from dataclasses import asdict

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_database
from app.domain.risk import RiskInputs, compute_risk
from app.integrations.analytics import stream_risk_snapshot
from app.integrations.satellite import get_satellite_data
from app.integrations.weather import get_weather
from app.models.documents import DiseaseAnalysis, Farm, FarmRisk, SatelliteSnapshot
from app.schemas.farms import FarmCreate, FarmUpdate

router = APIRouter(dependencies=[Depends(require_database)])


async def _get_farm_or_404(farm_id: PydanticObjectId) -> Farm:
    farm = await Farm.get(farm_id)
    if farm is None:
        raise HTTPException(404, "Farm not found")
    return farm


@router.post("", status_code=201)
async def create_farm(payload: FarmCreate) -> Farm:
    farm = Farm(**payload.model_dump())
    await farm.insert()
    return farm


@router.get("/{farm_id}")
async def read_farm(farm_id: PydanticObjectId) -> Farm:
    return await _get_farm_or_404(farm_id)


@router.put("/{farm_id}")
async def update_farm(farm_id: PydanticObjectId, payload: FarmUpdate) -> Farm:
    farm = await _get_farm_or_404(farm_id)
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(farm, key, value)
    await farm.save()
    return farm


@router.get("/{farm_id}/risk")
async def read_farm_risk(farm_id: PydanticObjectId) -> dict:
    """Recompute and persist the farm's risk from the freshest signals available."""
    farm = await _get_farm_or_404(farm_id)

    weather = await get_weather(farm.location.lat, farm.location.lng)

    snapshot = (
        await SatelliteSnapshot.find(SatelliteSnapshot.farm_id == str(farm_id))
        .sort(-SatelliteSnapshot.created_at)
        .first_or_none()
    )
    if snapshot is None:
        # No stored snapshot: fetch one now so vegetation risk is real where we can
        # get it, and persist it for the district roll-up.
        try:
            live = await get_satellite_data(farm.location.lat, farm.location.lng, farm.district)
            snapshot = SatelliteSnapshot(farm_id=str(farm_id), **live, is_demo=farm.is_demo)
            await snapshot.insert()
        except Exception:
            snapshot = None

    diagnosis = (
        await DiseaseAnalysis.find(DiseaseAnalysis.farm_id == str(farm_id))
        .sort(-DiseaseAnalysis.analyzed_at)
        .first_or_none()
    )

    current = weather.get("current") or {}
    result = compute_risk(
        RiskInputs(
            irrigation=farm.irrigation,
            soil_moisture=farm.soil.moisture,
            temperature_c=current.get("temperature_c"),
            rainfall_mm_7d=weather.get("rainfall_mm_7d"),
            ndvi=snapshot.ndvi if snapshot else None,
            disease_label=diagnosis.label if diagnosis else None,
            disease_confidence=diagnosis.confidence if diagnosis else None,
            weather_degraded=weather.get("degraded", False),
        )
    )

    record = FarmRisk(farm_id=str(farm_id), is_demo=farm.is_demo, **asdict(result))
    await record.insert()

    # MongoDB stays the system of record; the warehouse gets an append-only copy
    # so district and state trends can be queried over seasons. A failure here is
    # invisible to the farmer.
    warehoused = await stream_risk_snapshot(
        farm_id=str(farm_id),
        district=farm.district,
        state=farm.state,
        crop=farm.crop,
        risk=asdict(result),
    )

    return {
        **asdict(result),
        "farm_id": str(farm_id),
        "computed_at": record.computed_at.isoformat(),
        "sources": {
            "weather": weather.get("source"),
            "weather_degraded": weather.get("degraded", False),
            "satellite": snapshot.source if snapshot else None,
            "satellite_is_live": snapshot.is_live if snapshot else None,
            "diagnosis": diagnosis.source if diagnosis else None,
            "warehoused": warehoused,
        },
    }
