"""Government scheme directory (PRD F10 support, audit E2).

Served from the curated dataset in ``data/schemes.json``. These are public scheme
descriptions with official links — the API does not claim eligibility on anyone's
behalf, it points at the source.
"""

import json
from functools import lru_cache
from typing import Any

from fastapi import APIRouter, Query

from app.core.paths import DATA_DIR

router = APIRouter()


@lru_cache
def _load() -> dict[str, Any]:
    return json.loads((DATA_DIR / "schemes.json").read_text(encoding="utf-8"))


@router.get("")
async def list_schemes(
    state: str | None = Query(default=None, max_length=60),
    q: str | None = Query(default=None, max_length=80),
) -> dict:
    data = _load()

    schemes: list[dict[str, Any]] = [
        {**item, "scope": "National"} for item in data.get("national_schemes", [])
    ]
    state_schemes = data.get("state_specific_schemes", {})
    if state and state in state_schemes:
        schemes.extend({**item, "scope": state} for item in state_schemes[state])

    if q:
        needle = q.lower()
        schemes = [
            item
            for item in schemes
            if needle in item.get("name", "").lower()
            or needle in item.get("description", "").lower()
            or needle in item.get("category", "").lower()
        ]

    return {
        "schemes": schemes,
        "states_available": sorted(state_schemes.keys()),
        "source": "curated from public scheme portals",
        "disclaimer": (
            "Scheme details change. Confirm eligibility and deadlines on the official "
            "portal linked with each scheme before applying."
        ),
    }
