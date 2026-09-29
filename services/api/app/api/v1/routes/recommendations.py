"""Crop suitability endpoints (PRD F6)."""

from dataclasses import asdict

from fastapi import APIRouter, HTTPException

from app.domain.suitability import FarmContext, rank_crops
from app.integrations.gemini import GeminiUnavailable, generate_json
from app.schemas.recommendations import CropExplainRequest, CropRecommendationRequest

router = APIRouter()

DISCLAIMER = (
    "Suitability scores are decision support built from prototype assumptions. "
    "They are not validated agronomic advice and not a guarantee of yield."
)


@router.post("/crops")
async def recommend_crops(payload: CropRecommendationRequest) -> dict:
    ranked = rank_crops(
        FarmContext(
            season=payload.season,
            soil_type=payload.soil_type,
            irrigation=payload.irrigation,
            temperature_c=payload.temperature_c,
            seasonal_rainfall_mm=payload.seasonal_rainfall_mm,
        )
    )
    return {
        "recommendations": [asdict(item) for item in ranked],
        "disclaimer": DISCLAIMER,
    }


EXPLAIN_SCHEMA = {
    "type": "object",
    "properties": {
        "explanations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "crop": {"type": "string"},
                    "verdict": {"type": "string"},
                    "why": {"type": "string"},
                    "watch_out_for": {"type": "string"},
                },
                "required": ["crop", "verdict", "why", "watch_out_for"],
            },
        }
    },
    "required": ["explanations"],
}


@router.post("/crops/explain")
async def explain_recommendations(payload: CropExplainRequest) -> dict:
    """Narrate an already-computed ranking (PRD F6, audit E3).

    Gemini receives the scores and the per-criterion breakdown that the deterministic
    engine produced. It explains them. It does not re-rank, re-score, or introduce a
    crop that is not in the list it was given.
    """
    ranked = rank_crops(
        FarmContext(
            season=payload.season,
            soil_type=payload.soil_type,
            irrigation=payload.irrigation,
            temperature_c=payload.temperature_c,
            seasonal_rainfall_mm=payload.seasonal_rainfall_mm,
        )
    )
    top = ranked[: payload.limit]

    blocks = []
    for item in top:
        criteria = "\n".join(
            f"    - {c.criterion}: {c.points}/{c.max_points} — {c.explanation}"
            for c in item.criteria
        )
        unscored = (
            f"\n    - not assessed: {', '.join(item.unscored_criteria)}"
            if item.unscored_criteria
            else ""
        )
        blocks.append(f"  {item.crop} — {item.match_percentage}% match\n{criteria}{unscored}")

    prompt = f"""\
A deterministic suitability engine produced this ranking for a farm in
{payload.location} ({payload.season} season, {payload.soil_type} soil,
irrigation: {payload.irrigation}).

{chr(10).join(blocks)}

Explain each crop's score to the farmer in plain language. Work only from the
criteria listed above.

Do not change the order. Do not restate the percentages as your own judgement. Do
not mention a crop that is not listed. Where a criterion is marked "not assessed",
say that it was not assessed — do not guess what it would have been.
"""

    try:
        result = await generate_json(prompt, EXPLAIN_SCHEMA, language=payload.language)
    except GeminiUnavailable as exc:
        raise HTTPException(
            503,
            "Explanations need Gemini, which is not configured. The scores and the "
            "criterion breakdown above are computed locally and remain available.",
        ) from exc

    return {
        **result,
        "ranking_source": "deterministic-suitability-engine",
        "explanation_source": "gemini",
        "disclaimer": DISCLAIMER,
    }
