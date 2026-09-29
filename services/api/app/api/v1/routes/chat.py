"""Context-grounded farm assistant (PRD §14 `/api/ai/chat`, F10, F11).

Replaces the previous voice page, which faked listening and then stated an
invented cotton price as fact (audit A2). This endpoint loads the farm's *stored*
record — profile, latest risk, live weather, latest NDVI — and gives Gemini only
that. The model answers from the context or says it does not know.

When Gemini is not configured the endpoint returns 503. It does not answer.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_database
from app.integrations.gemini import GeminiUnavailable, generate_json
from app.integrations.weather import get_weather
from app.models.documents import DiseaseAnalysis, Farm, FarmRisk, SatelliteSnapshot
from app.schemas.chat import ChatRequest

router = APIRouter(dependencies=[Depends(require_database)])

CHAT_SCHEMA = {
    "type": "object",
    "properties": {
        "answer": {"type": "string"},
        "grounded_in": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Which supplied facts the answer used.",
        },
        "answerable": {
            "type": "boolean",
            "description": "False when the supplied context does not contain the answer.",
        },
    },
    "required": ["answer", "grounded_in", "answerable"],
}


async def _build_context(farm_id: str) -> tuple[Farm, list[str]]:
    farm = await Farm.get(farm_id)
    if farm is None:
        raise HTTPException(404, "Farm not found")

    lines = [
        f"Farm: {farm.area_acres} acre {farm.crop} in {farm.district}, {farm.state}",
        f"Season: {farm.season}",
        f"Soil type: {farm.soil.type}",
        f"Irrigation: {farm.irrigation}",
    ]
    if farm.soil.moisture:
        lines.append(f"Soil moisture (entered by the farmer): {farm.soil.moisture}")

    weather = await get_weather(farm.location.lat, farm.location.lng)
    if weather.get("degraded") or not weather.get("current"):
        lines.append("Live weather: UNAVAILABLE")
    else:
        current = weather["current"]
        lines.append(
            f"Weather now: {current['temperature_c']}°C, "
            f"{current['humidity_pct']}% humidity, "
            f"{weather.get('rainfall_mm_7d', 0)}mm rain expected over 7 days"
        )

    risk = (
        await FarmRisk.find(FarmRisk.farm_id == farm_id)
        .sort(-FarmRisk.computed_at)
        .first_or_none()
    )
    if risk:
        lines.append(f"Computed farm risk: {risk.level} ({risk.overall_score}/100)")
        lines.append(
            f"  water {risk.water_stress}, heat {risk.heat_stress}, "
            f"disease {risk.disease_risk}, rainfall {risk.rainfall_risk}, "
            f"vegetation {risk.vegetation_risk}"
        )
        lines.extend(f"  assumption: {note}" for note in risk.assumptions)
    else:
        lines.append("Computed farm risk: not yet calculated")

    snapshot = (
        await SatelliteSnapshot.find(SatelliteSnapshot.farm_id == farm_id)
        .sort(-SatelliteSnapshot.created_at)
        .first_or_none()
    )
    if snapshot:
        provenance = "live satellite" if snapshot.is_live else "DEMO DATASET, not live"
        lines.append(
            f"Vegetation: NDVI {snapshot.ndvi} ({snapshot.vegetation_status}), "
            f"captured {snapshot.captured_on} — {provenance}"
        )
    else:
        lines.append("Vegetation (NDVI): UNAVAILABLE")

    diagnosis = (
        await DiseaseAnalysis.find(DiseaseAnalysis.farm_id == farm_id)
        .sort(-DiseaseAnalysis.analyzed_at)
        .first_or_none()
    )
    if diagnosis:
        lines.append(
            f"Last leaf scan: possible {diagnosis.label} "
            f"at {diagnosis.confidence:.0%} confidence ({diagnosis.source})"
        )
    else:
        lines.append("Last leaf scan: none on record")

    return farm, lines


@router.post("")
async def chat(payload: ChatRequest) -> dict:
    farm, context = await _build_context(payload.farm_id)

    history = ""
    if payload.history:
        turns = "\n".join(
            f"{turn.role}: {turn.content}" for turn in payload.history[-6:]
        )
        history = f"\nEarlier in this conversation:\n{turns}\n"

    prompt = f"""\
Everything known about this farm:
{chr(10).join(f"- {line}" for line in context)}
{history}
The farmer asks:
"{payload.message}"

Answer from the facts above and nothing else. Anything marked UNAVAILABLE or
DEMO DATASET must be described as such — never quoted as a live measurement, and
never replaced with a figure of your own. If the facts above do not contain the
answer, set answerable to false and say what the farmer would need to record for
you to answer it.
"""

    try:
        result = await generate_json(prompt, CHAT_SCHEMA, language=payload.language)
    except GeminiUnavailable as exc:
        raise HTTPException(
            503,
            "The assistant needs Gemini, which is not configured on this server. "
            "Your farm dashboard and risk score still work without it.",
        ) from exc

    return {
        **result,
        "farm_id": payload.farm_id,
        "language": payload.language,
        "source": "gemini",
        "disclaimer": (
            "AI-generated decision support based only on your recorded farm data. "
            "Verify with your local agricultural extension officer before acting."
        ),
    }
