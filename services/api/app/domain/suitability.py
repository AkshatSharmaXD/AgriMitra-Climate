"""Crop suitability engine (PRD F6/F7).

Deterministic scoring over a curated crop dataset. Gemini explains the ranking;
it does not produce it.

Unit correctness
----------------
``crops.json`` states ``rainfallRequirement`` in millimetres **accumulated over a
growing season**. The previous implementation compared that against Open-Meteo's
``current.precipitation``, which is millimetres in the **last hour**. Every crop
therefore scored as "significantly below optimal" and the rainfall criterion was
dead weight. This module takes an explicit ``seasonal_rainfall_mm`` measured over a
comparable window, and reports the criterion as unavailable when that is missing
instead of quietly substituting a number.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

from app.core.paths import DATA_DIR

# One point per criterion. Rainfall is dropped from the denominator when no
# comparable seasonal figure is available, so an unknown never reads as a failure.
CRITERIA = ("season", "soil", "water", "temperature", "rainfall")


@dataclass
class FarmContext:
    season: str
    soil_type: str
    irrigation: str
    temperature_c: float | None = None
    seasonal_rainfall_mm: float | None = None


@dataclass
class CriterionScore:
    criterion: str
    points: float
    max_points: float
    explanation: str


@dataclass
class CropScore:
    crop: str
    match_percentage: int
    criteria: list[CriterionScore]
    requirements: dict[str, str]
    unscored_criteria: list[str]


@lru_cache
def load_crops() -> list[dict[str, Any]]:
    return json.loads((DATA_DIR / "crops.json").read_text(encoding="utf-8"))


def _score_water(requirement: str, irrigation: str) -> tuple[float, str]:
    req = requirement.lower()
    irg = (irrigation or "").lower()
    assured = any(token in irg for token in ("good", "well", "full", "canal", "tube"))
    constrained = any(token in irg for token in ("limited", "rainfed", "none"))

    if req == "low":
        return 1.0, "Low water demand is met by the irrigation available."
    if req == "high":
        if assured:
            return 1.0, "High water demand is supported by assured irrigation."
        return 0.0, "High water demand is unlikely to be met by the irrigation available."
    if constrained:
        return 0.5, "Moderate water demand is only partly met by limited irrigation."
    return 1.0, "Moderate water demand is met by the irrigation available."


def score_crop(crop: dict[str, Any], ctx: FarmContext) -> CropScore:
    criteria: list[CriterionScore] = []
    unscored: list[str] = []

    matched_season = ctx.season in crop["season"]
    criteria.append(
        CriterionScore(
            "season",
            1.0 if matched_season else 0.0,
            1.0,
            f"{ctx.season} {'is' if matched_season else 'is not'} a normal sowing "
            f"season for {crop['crop']} ({', '.join(crop['season'])}).",
        )
    )

    matched_soil = ctx.soil_type in crop["soil"]
    criteria.append(
        CriterionScore(
            "soil",
            1.0 if matched_soil else 0.0,
            1.0,
            f"{ctx.soil_type} soil {'is' if matched_soil else 'is not'} among the "
            f"preferred types ({', '.join(crop['soil'])}).",
        )
    )

    water_points, water_note = _score_water(crop["waterRequirement"], ctx.irrigation)
    criteria.append(CriterionScore("water", water_points, 1.0, water_note))

    temp_range = crop["temperatureRange"]
    if ctx.temperature_c is None:
        unscored.append("temperature")
    else:
        inside = temp_range["min"] <= ctx.temperature_c <= temp_range["max"]
        criteria.append(
            CriterionScore(
                "temperature",
                1.0 if inside else 0.0,
                1.0,
                f"Current {ctx.temperature_c:.0f}°C "
                f"{'sits inside' if inside else 'sits outside'} the "
                f"{temp_range['min']}–{temp_range['max']}°C range.",
            )
        )

    rain_range = crop["rainfallRequirement"]
    if ctx.seasonal_rainfall_mm is None:
        unscored.append("rainfall")
    else:
        rain = ctx.seasonal_rainfall_mm
        if rain_range["min"] <= rain <= rain_range["max"]:
            points, note = 1.0, "Seasonal rainfall is inside the optimal band."
        elif rain < rain_range["min"]:
            shortfall = rain / rain_range["min"]
            points = 0.5 if shortfall >= 0.5 else 0.0
            note = (
                f"Seasonal rainfall of {rain:.0f}mm is below the "
                f"{rain_range['min']}mm the crop normally needs."
            )
        else:
            points = 0.5
            note = (
                f"Seasonal rainfall of {rain:.0f}mm exceeds the "
                f"{rain_range['max']}mm upper band; drainage matters."
            )
        criteria.append(CriterionScore("rainfall", points, 1.0, note))

    earned = sum(c.points for c in criteria)
    available = sum(c.max_points for c in criteria)
    percentage = int(round((earned / available) * 100)) if available else 0

    return CropScore(
        crop=crop["crop"],
        match_percentage=percentage,
        criteria=criteria,
        requirements={
            "water": crop["waterRequirement"],
            "temperature": f"{temp_range['min']}–{temp_range['max']}°C",
            "rainfall": f"{rain_range['min']}–{rain_range['max']}mm per season",
        },
        unscored_criteria=unscored,
    )


def rank_crops(ctx: FarmContext) -> list[CropScore]:
    scored = [score_crop(crop, ctx) for crop in load_crops()]
    scored.sort(key=lambda c: (-c.match_percentage, c.crop))
    return scored
