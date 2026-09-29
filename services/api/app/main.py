"""AgriMitra Climate — core domain API.

Security posture (PRD §18): explicit CORS allowlist, security headers, request
rate limiting, strict upload validation, and no secret with a usable default.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1.router import api_router
from app.core.config import get_settings

settings = get_settings()

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logging.basicConfig(
    format="%(message)s",
    level=settings.log_level,
)
logger = structlog.get_logger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.core.database import close_mongo_connection, connect_to_mongo

    await connect_to_mongo()
    logger.info(
        "Startup complete | gemini=%s earth_engine=%s market=%s",
        settings.gemini_enabled,
        settings.earth_engine_enabled,
        settings.market_data_enabled,
    )
    yield
    await close_mongo_connection()


app = FastAPI(
    title="AgriMitra Climate API",
    version="2.0.0",
    description="Farm intelligence, climate risk, crop suitability and district analytics.",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"error": "Too many requests", "detail": "Please slow down and retry shortly."},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), microphone=(self), camera=(self)"
    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
async def health() -> dict[str, object]:
    """Liveness plus a truthful capability report, so the UI can label its data."""
    from app.core.database import is_connected

    return {
        "status": "ok",
        "version": app.version,
        "capabilities": {
            "database": is_connected(),
            "gemini": settings.gemini_enabled,
            "earth_engine": settings.earth_engine_enabled,
            "market_data": settings.market_data_enabled,
        },
    }
