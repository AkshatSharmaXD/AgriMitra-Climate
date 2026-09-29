"""Satellite endpoints (PRD F3)."""

from fastapi import APIRouter, HTTPException, Query

from app.integrations.satellite import get_satellite_data

router = APIRouter()


@router.get("")
async def read_satellite(
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    district: str | None = Query(default=None, max_length=80),
) -> dict:
    try:
        return await get_satellite_data(lat, lng, district)
    except LookupError as exc:
        raise HTTPException(404, str(exc)) from exc
