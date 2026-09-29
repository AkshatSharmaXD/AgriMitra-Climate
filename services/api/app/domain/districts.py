"""District aggregation (PRD F12).

Rolls farm-level records up to district and state summaries. Every count is
derived from stored documents; nothing here is illustrative.
"""

from __future__ import annotations

from collections import Counter
from typing import Any

from app.models.documents import DiseaseAnalysis, Farm, FarmRisk

RISK_BANDS = ("LOW", "MEDIUM", "HIGH", "CRITICAL")


def _band(value: float) -> str:
    if value <= 30:
        return "LOW"
    if value <= 60:
        return "MEDIUM"
    if value <= 80:
        return "HIGH"
    return "CRITICAL"


async def _latest_risk_by_farm() -> dict[str, FarmRisk]:
    latest: dict[str, FarmRisk] = {}
    async for risk in FarmRisk.find_all().sort(-FarmRisk.computed_at):
        latest.setdefault(risk.farm_id, risk)
    return latest


async def _disease_counts_by_farm() -> dict[str, Counter[str]]:
    counts: dict[str, Counter[str]] = {}
    async for record in DiseaseAnalysis.find(DiseaseAnalysis.farm_id != None):  # noqa: E711
        normalized = record.label.strip().lower().replace("_", " ")
        if "healthy" in normalized or "not a plant" in normalized:
            continue
        counts.setdefault(record.farm_id, Counter())[record.label] += 1
    return counts


async def get_district_summaries() -> list[dict[str, Any]]:
    farms = await Farm.find_all().to_list()
    risks = await _latest_risk_by_farm()
    diseases = await _disease_counts_by_farm()

    grouped: dict[str, list[Farm]] = {}
    for farm in farms:
        grouped.setdefault(farm.district, []).append(farm)

    summaries: list[dict[str, Any]] = []
    for district, district_farms in grouped.items():
        bands = dict.fromkeys(RISK_BANDS, 0)
        crops: Counter[str] = Counter()
        disease_counts: Counter[str] = Counter()
        water_scores: list[float] = []
        scored_farms = 0

        for farm in district_farms:
            crops[farm.crop] += 1
            disease_counts.update(diseases.get(str(farm.id), Counter()))
            risk = risks.get(str(farm.id))
            if risk is None:
                continue
            bands[risk.level] += 1
            water_scores.append(risk.water_stress)
            scored_farms += 1

        average_water = sum(water_scores) / len(water_scores) if water_scores else None

        summaries.append(
            {
                "district": district,
                "farm_count": len(district_farms),
                "farms_with_risk": scored_farms,
                "risk_bands": bands,
                "top_crops": [crop for crop, _ in crops.most_common(3)],
                "dominant_crop": crops.most_common(1)[0][0] if crops else None,
                "water_stress_level": _band(average_water) if average_water is not None else None,
                "water_stress_score": (
                    round(average_water, 1) if average_water is not None else None
                ),
                "disease_occurrences": dict(disease_counts.most_common(5)),
                "is_demo": all(farm.is_demo for farm in district_farms),
            }
        )

    summaries.sort(key=lambda item: item["district"])
    return summaries


async def get_state_overview() -> dict[str, Any]:
    summaries = await get_district_summaries()
    totals = dict.fromkeys(RISK_BANDS, 0)
    for summary in summaries:
        for band in RISK_BANDS:
            totals[band] += summary["risk_bands"][band]
    return {
        "districts_analyzed": len(summaries),
        "farms_analyzed": sum(item["farm_count"] for item in summaries),
        "risk_bands": totals,
        "districts": summaries,
        "is_demo": all(item["is_demo"] for item in summaries) if summaries else True,
    }
