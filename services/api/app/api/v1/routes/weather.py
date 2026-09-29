"""Weather endpoints (PRD F2)."""

from fastapi import APIRouter, HTTPException, Query

from app.integrations.weather import geocode, get_seasonal_rainfall_mm, get_weather

router = APIRouter()


@router.get("")
async def read_weather(
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
) -> dict:
    return await get_weather(lat, lng)


@router.get("/seasonal-rainfall")
async def read_seasonal_rainfall(
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    season: str = Query(pattern="^(Kharif|Rabi|Zaid)$"),
) -> dict:
    result = await get_seasonal_rainfall_mm(lat, lng, season)
    if result is None:
        raise HTTPException(503, "Rainfall archive is unavailable right now.")
    return result


@router.get("/geocode")
async def read_geocode(q: str = Query(min_length=2, max_length=80)) -> dict:
    result = await geocode(q)
    if result is None:
        raise HTTPException(404, f"No location found for '{q}'.")
    return result
