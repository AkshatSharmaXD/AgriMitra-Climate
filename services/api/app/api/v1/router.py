"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1.routes import (
    advisory,
    diagnosis,
    districts,
    farms,
    recommendations,
    satellite,
    weather,
)

api_router = APIRouter()
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(satellite.router, prefix="/satellite", tags=["satellite"])
api_router.include_router(farms.router, prefix="/farms", tags=["farms"])
api_router.include_router(
    recommendations.router, prefix="/recommendations", tags=["recommendations"]
)
api_router.include_router(advisory.router, prefix="/advisory", tags=["advisory"])
api_router.include_router(diagnosis.router, prefix="/diagnosis", tags=["diagnosis"])
api_router.include_router(districts.router, prefix="/districts", tags=["districts"])
