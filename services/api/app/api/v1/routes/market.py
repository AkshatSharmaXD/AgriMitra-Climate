"""Mandi price lookup (data.gov.in Agmarknet).

Returns 503 when no API key is configured. It never falls back to invented prices —
the previous client shipped hardcoded prices against real trade names (audit A7) and
the voice page stated a fabricated cotton rate as fact (audit A2).
"""

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

RESOURCE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"


@router.get("")
async def read_market_prices(
    state: str = Query(default="Rajasthan", max_length=60),
    commodity: str = Query(default="Wheat", max_length=60),
) -> dict:
    if not settings.market_data_enabled:
        raise HTTPException(
            503,
            "Mandi prices need a data.gov.in API key, which is not configured on "
            "this server. No price is shown rather than an estimated one.",
        )

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=4.0)) as client:
            response = await client.get(
                RESOURCE_URL,
                params={
                    "api-key": settings.data_gov_api_key,
                    "format": "json",
                    "limit": 500,
                    "filters[state]": state,
                    "filters[commodity]": commodity,
                },
            )
            response.raise_for_status()
            records = response.json().get("records", [])
    except httpx.HTTPError as exc:
        raise HTTPException(502, "Agmarknet did not respond.") from exc

    prices = []
    for record in records:
        try:
            modal = float(record.get("modal_price", 0))
        except (TypeError, ValueError):
            continue
        if modal <= 0:
            continue
        prices.append(
            {
                "district": record.get("district") or "Unknown",
                "market": record.get("market") or "Unknown",
                "modal_price_per_quintal": modal,
                "arrival_date": record.get("arrival_date"),
            }
        )

    if not prices:
        raise HTTPException(404, f"Agmarknet has no recent {commodity} prices for {state}.")

    prices.sort(key=lambda item: item["modal_price_per_quintal"], reverse=True)
    return {
        "query": {"state": state, "commodity": commodity},
        "best": prices[0],
        "prices": prices,
        "source": "data.gov.in — Agmarknet",
        "disclaimer": "Prices are as reported to Agmarknet and may lag the mandi.",
    }
