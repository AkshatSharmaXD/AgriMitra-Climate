"""Redis cache (PRD §13A Tier B).

Why this exists: two real costs, not a checkbox.

* Open-Meteo is free and rate-limited. The district dashboard fans out one weather
  call per farm; 100 seeded farms in ten districts is 100 requests for ten distinct
  forecasts. Cached, it is ten.
* Satellite NDVI is an Earth Engine reduction costing seconds and quota, for a value
  that changes at most once every five days.

Degradation: with no ``REDIS_URL`` the cache is a no-op and every call goes
straight through. Nothing in the product depends on it being present.
"""

from __future__ import annotations

import json
from typing import Any

import structlog

from app.core.config import get_settings

logger = structlog.get_logger(__name__)

_redis: Any | None = None
_unavailable = False

# Tuned to how fast the underlying data actually moves.
TTL_WEATHER = 900  # 15 minutes — forecasts update hourly at best
TTL_SATELLITE = 21_600  # 6 hours — Sentinel-2 revisits every ~5 days
TTL_SEASONAL_RAIN = 86_400  # 24 hours — a closed historical window


async def _connection():
    global _redis, _unavailable

    if _unavailable:
        return None
    if _redis is not None:
        return _redis

    settings = get_settings()
    if not settings.configured(settings.redis_url):
        _unavailable = True
        return None

    try:
        import redis.asyncio as redis_async

        client = redis_async.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True
        )
        await client.ping()
    except Exception as exc:
        logger.info("cache_disabled", reason=str(exc))
        _unavailable = True
        return None

    _redis = client
    logger.info("cache_enabled")
    return _redis


async def get(key: str) -> Any | None:
    client = await _connection()
    if client is None:
        return None
    try:
        raw = await client.get(key)
    except Exception:
        return None
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


async def set(key: str, value: Any, ttl_seconds: int) -> None:
    client = await _connection()
    if client is None:
        return
    try:
        await client.set(key, json.dumps(value), ex=ttl_seconds)
    except Exception as exc:
        # A cache write failing is not an application error.
        logger.debug("cache_write_failed", error=str(exc), key=key)


async def close() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


def geo_key(prefix: str, lat: float, lng: float, *parts: str) -> str:
    """Cache key rounded to ~1km, so neighbouring farms share one entry.

    Two farms 300m apart have the same forecast; caching them separately would
    defeat the point.
    """
    suffix = ":".join(str(p) for p in parts if p)
    base = f"{prefix}:{lat:.2f}:{lng:.2f}"
    return f"{base}:{suffix}" if suffix else base
