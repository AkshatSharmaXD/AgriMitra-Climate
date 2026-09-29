"""Satellite / NDVI intelligence (PRD F3).

Two providers behind one interface:

``EarthEngineProvider``
    Real Sentinel-2 NDVI from Google Earth Engine. Only selected when service
    account credentials are present *and* initialise successfully.

``SeededDemoProvider``
    A small curated per-district dataset used for the demo. It labels itself
    ``seeded-demo`` and carries ``is_live=False``.

The previous Node implementation returned hard-coded numbers tagged
``source: "google-earth-engine"`` whenever a credentials string existed. That
presented invented values as live satellite data, which PRD §16 forbids outright.
A provider here either returns a genuine observation or raises, and the caller
falls back to the demo provider with honest labelling.
"""

from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from datetime import UTC, datetime, timedelta
from functools import lru_cache
from typing import Any

from app.core.config import get_settings
from app.core.paths import DATA_DIR

logger = logging.getLogger(__name__)



def vegetation_status(ndvi: float) -> str:
    if ndvi < 0.2:
        return "Bare or non-vegetated"
    if ndvi < 0.4:
        return "Sparse"
    if ndvi < 0.6:
        return "Moderate"
    if ndvi < 0.75:
        return "Healthy"
    return "Dense"


class SatelliteProvider(ABC):
    name: str
    is_live: bool

    @abstractmethod
    async def get_ndvi(self, lat: float, lng: float, district: str | None) -> dict[str, Any]: ...


class EarthEngineProvider(SatelliteProvider):
    name = "google-earth-engine"
    is_live = True

    def __init__(self, credentials_json: str) -> None:
        import ee  # imported lazily so the demo path needs no GEE install

        info = json.loads(credentials_json)
        credentials = ee.ServiceAccountCredentials(info["client_email"], key_data=credentials_json)
        ee.Initialize(credentials)
        self._ee = ee

    async def get_ndvi(self, lat: float, lng: float, district: str | None) -> dict[str, Any]:
        ee = self._ee
        point = ee.Geometry.Point([lng, lat])
        end = datetime.now(UTC).date()
        start = end - timedelta(days=30)

        collection = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(point)
            .filterDate(str(start), str(end))
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30))
            .sort("system:time_start", False)
        )
        image = ee.Image(collection.first())
        ndvi_image = image.normalizedDifference(["B8", "B4"]).rename("NDVI")

        sample = ndvi_image.reduceRegion(
            reducer=ee.Reducer.mean(), geometry=point.buffer(150), scale=10, maxPixels=1e8
        ).getInfo()
        ndvi = sample.get("NDVI")
        if ndvi is None:
            raise RuntimeError("Earth Engine returned no cloud-free NDVI for this location")

        captured = ee.Date(image.get("system:time_start")).format("YYYY-MM-dd").getInfo()
        ndvi = round(float(ndvi), 3)
        return {
            "ndvi": ndvi,
            "vegetation_health": round(max(0.0, min(1.0, (ndvi - 0.1) / 0.8)), 2),
            "vegetation_status": vegetation_status(ndvi),
            "captured_on": captured,
            "source": self.name,
            "is_live": True,
            "instrument": "Sentinel-2 SR Harmonized",
        }


class SeededDemoProvider(SatelliteProvider):
    name = "seeded-demo"
    is_live = False

    @staticmethod
    @lru_cache
    def _data() -> dict[str, Any]:
        return json.loads((DATA_DIR / "ndvi-districts.json").read_text(encoding="utf-8"))

    async def get_ndvi(self, lat: float, lng: float, district: str | None) -> dict[str, Any]:
        data = self._data()
        key = district if district in data else None
        if key is None:
            raise LookupError(
                "No demo NDVI record for this location. Configure Earth Engine credentials "
                "for live coverage outside the seeded districts."
            )
        record = data[key]
        ndvi = float(record["ndvi"])
        return {
            "ndvi": ndvi,
            "vegetation_health": record["vegetationHealth"],
            "vegetation_status": vegetation_status(ndvi),
            "captured_on": record["satelliteDate"],
            "source": self.name,
            "is_live": False,
            "notice": "Demo dataset — not a live satellite observation.",
        }


@lru_cache
def get_provider() -> SatelliteProvider:
    settings = get_settings()
    if settings.earth_engine_enabled:
        try:
            provider = EarthEngineProvider(settings.gee_service_account_json)  # type: ignore[arg-type]
            logger.info("Satellite: Earth Engine initialised")
            return provider
        except Exception:
            logger.exception("Satellite: Earth Engine init failed; using seeded demo data")
    else:
        logger.info("Satellite: no Earth Engine credentials; using seeded demo data")
    return SeededDemoProvider()


async def get_satellite_data(lat: float, lng: float, district: str | None) -> dict[str, Any]:
    provider = get_provider()
    try:
        return await provider.get_ndvi(lat, lng, district)
    except Exception:
        if provider.is_live:
            logger.exception("Satellite: live lookup failed; falling back to seeded demo data")
            return await SeededDemoProvider().get_ndvi(lat, lng, district)
        raise
