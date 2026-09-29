"""District intelligence endpoints (PRD F12, F14)."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_database
from app.domain.districts import get_district_summaries, get_state_overview
from app.integrations.gemini import GeminiUnavailable, generate_json
from app.schemas.districts import InterventionRequest

router = APIRouter(dependencies=[Depends(require_database)])

DISCLAIMER = (
    "AI output is decision support for officials. It is not an automatic "
    "government decision and carries no policy authority."
)

INTERVENTION_SCHEMA = {
    "type": "object",
    "properties": {
        "interventions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "priority": {"type": "string", "enum": ["High", "Medium", "Low"]},
                    "action": {"type": "string"},
                    "reasoning": {"type": "string"},
                },
                "required": ["priority", "action", "reasoning"],
            },
        }
    },
    "required": ["interventions"],
}


@router.get("/overview")
async def read_overview() -> dict:
    return await get_state_overview()


@router.get("/summary")
async def read_summaries() -> list[dict]:
    return await get_district_summaries()


@router.post("/{district}/interventions")
async def create_interventions(district: str, payload: InterventionRequest) -> dict:
    summaries = {item["district"]: item for item in await get_district_summaries()}
    summary = summaries.get(district)
    if summary is None:
        raise HTTPException(404, f"No aggregated data for district '{district}'.")

    prompt = f"""\
Aggregated signals for {district}. These are computed counts — do not restate them
back to the reader and do not introduce any figure that is not listed here.

- Farms on record: {summary['farm_count']} ({summary['farms_with_risk']} with a computed risk)
- Risk distribution: {summary['risk_bands']}
- Dominant crop: {summary['dominant_crop']}
- Top crops: {', '.join(summary['top_crops']) or 'none recorded'}
- Mean water stress: {summary['water_stress_score']} / 100 ({summary['water_stress_level']})
- Recorded disease occurrences: {summary['disease_occurrences'] or 'none'}

Propose 3 to 5 prioritised agricultural interventions an extension department could
act on this season. Give the reasoning behind each one.
"""

    try:
        result = await generate_json(prompt, INTERVENTION_SCHEMA, language=payload.language)
    except GeminiUnavailable as exc:
        raise HTTPException(
            503,
            "Intervention analysis needs Gemini, which is not configured. "
            "The district statistics above are still computed from real records.",
        ) from exc

    return {**result, "district": district, "source": "gemini", "disclaimer": DISCLAIMER}
