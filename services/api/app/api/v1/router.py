"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1.routes import (
    advisory,
    chat,
    diagnosis,
    districts,
    farmers,
    farms,
    market,
    recommendations,
    satellite,
    schemes,
    voice,
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
api_router.include_router(farmers.router, prefix="/farmers", tags=["farmers"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(schemes.router, prefix="/schemes", tags=["schemes"])
api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
