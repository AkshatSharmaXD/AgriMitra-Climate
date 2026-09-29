"""Open-Meteo weather integration (PRD F2).

Returns real observations with an explicit source and timestamp, or a clearly
``degraded`` payload. It never fabricates a reading, and callers are expected to
check ``degraded`` rather than treating zeros as measurements.
"""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from typing import Any

import httpx

from app.integrations import cache

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"

TIMEOUT = httpx.Timeout(8.0, connect=4.0)

# Approximate Indian cropping calendar, used only to pick the archive window that
# matches a crop season. The rainfall total itself is measured, not assumed.
SEASON_WINDOWS = {
    "Kharif": ((6, 1), (10, 31)),
    "Rabi": ((10, 1), (3, 31)),
    "Zaid": ((3, 1), (6, 30)),
}


async def get_weather(lat: float, lng: float) -> dict[str, Any]:
    # The district view asks for one forecast per farm; neighbouring farms share
    # a forecast, so the key is rounded to roughly a kilometre.
    key = cache.geo_key("wx", lat, lng)
    if (hit := await cache.get(key)) is not None:
        return hit

    params = {
        "latitude": lat,
        "longitude": lng,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
        "forecast_days": 7,
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(FORECAST_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError):
        return {
            "current": None,
            "forecast": [],
            "source": "open-meteo",
            "degraded": True,
            "fetched_at": datetime.now(UTC).isoformat(),
        }

    current = data["current"]
    daily = data.get("daily", {})
    times = daily.get("time", [])
    forecast = [
        {
            "date": times[i],
            "temp_max": daily["temperature_2m_max"][i],
            "temp_min": daily["temperature_2m_min"][i],
            "precipitation_mm": daily["precipitation_sum"][i],
            "weather_code": daily["weather_code"][i],
        }
        for i in range(len(times))
    ]

    payload = {
        "current": {
            "temperature_c": current["temperature_2m"],
            "humidity_pct": current["relative_humidity_2m"],
            "precipitation_mm": current.get("precipitation") or 0.0,
            "wind_speed_kmh": current["wind_speed_10m"],
            "weather_code": current["weather_code"],
        },
        "forecast": forecast,
        # Comparable-window rainfall for the risk engine: the 7 forecast days summed.
        "rainfall_mm_7d": round(sum(d["precipitation_mm"] or 0.0 for d in forecast), 1),
        "source": "open-meteo",
        "degraded": False,
        "fetched_at": datetime.now(UTC).isoformat(),
    }
    await cache.set(key, payload, cache.TTL_WEATHER)
    return payload


def _season_window(season: str, today: date) -> tuple[date, date]:
    (start_m, start_d), (end_m, end_d) = SEASON_WINDOWS.get(season, SEASON_WINDOWS["Rabi"])
    end_year = today.year if (today.month, today.day) >= (end_m, end_d) else today.year - 1
    end = date(end_year, end_m, end_d)
    start_year = end_year if start_m <= end_m else end_year - 1
    return date(start_year, start_m, start_d), end


async def get_seasonal_rainfall_mm(lat: float, lng: float, season: str) -> dict[str, Any] | None:
    """Measured precipitation total over the most recent completed season window.

    This is what the crop dataset's seasonal ``rainfallRequirement`` must be compared
    against. Returns ``None`` when the archive is unreachable so the suitability
    engine can mark the criterion unscored rather than guess.
    """
    start, end = _season_window(season, datetime.now(UTC).date() - timedelta(days=5))
    key = cache.geo_key("rain", lat, lng, season)
    if (hit := await cache.get(key)) is not None:
        return hit

    params = {
        "latitude": lat,
        "longitude": lng,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "daily": "precipitation_sum",
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(ARCHIVE_URL, params=params)
            response.raise_for_status()
            daily = response.json()["daily"]["precipitation_sum"]
    except (httpx.HTTPError, KeyError, ValueError):
        return None

    total = sum(value for value in daily if value is not None)
    payload = {
        "total_mm": round(total, 1),
        "window_start": start.isoformat(),
        "window_end": end.isoformat(),
        "season": season,
        "source": "open-meteo-archive",
    }
    # A closed historical window cannot change; cache it for a day.
    await cache.set(key, payload, cache.TTL_SEASONAL_RAIN)
    return payload


async def geocode(query: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(
                GEOCODE_URL, params={"name": query, "count": 1, "format": "json"}
            )
            response.raise_for_status()
            results = response.json().get("results") or []
    except (httpx.HTTPError, ValueError):
        return None
    if not results:
        return None
    top = results[0]
    return {
        "name": top["name"],
        "admin1": top.get("admin1"),
        "country": top.get("country"),
        "lat": top["latitude"],
        "lng": top["longitude"],
    }
