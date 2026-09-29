"""Farm risk engine (PRD F5).

Architecture rule from the PRD: the numerical score is produced by deterministic
application logic here. Gemini only *explains* the score; it never invents it.

Every input that was not actually observed is recorded in ``assumptions`` so the UI
can show the farmer what the number was built from. Nothing is silently defaulted.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]

# PRD F5. Prototype assumptions, not validated coefficients — surfaced to the UI.
WEIGHTS = {
    "water_stress": 0.30,
    "heat_stress": 0.20,
    "disease_risk": 0.20,
    "rainfall_risk": 0.15,
    "vegetation_risk": 0.15,
}

# Labels the vision model emits for "nothing wrong" / "not a crop at all".
# Previously the Node implementation mapped *any* prediction confidence straight to
# disease risk, so a 0.95-confidence "healthy" produced a 95/100 disease risk and a
# rejected non-plant image produced 100. Both are now handled explicitly.
HEALTHY_LABELS = {"healthy", "no disease", "not a plant", "unknown", "error"}

NEUTRAL_DISEASE_RISK = 30.0
NEUTRAL_VEGETATION_RISK = 50.0


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


@dataclass
class RiskInputs:
    irrigation: str
    soil_moisture: str | None = None
    temperature_c: float | None = None
    rainfall_mm_7d: float | None = None
    ndvi: float | None = None
    disease_label: str | None = None
    disease_confidence: float | None = None
    weather_degraded: bool = False


@dataclass
class RiskResult:
    water_stress: float
    heat_stress: float
    rainfall_risk: float
    disease_risk: float
    vegetation_risk: float
    overall_score: int
    level: RiskLevel
    weights: dict[str, float] = field(default_factory=lambda: dict(WEIGHTS))
    assumptions: list[str] = field(default_factory=list)


def water_stress(irrigation: str, soil_moisture: str | None) -> float:
    score = 50.0
    irg = (irrigation or "").lower()
    if "limited" in irg or "rainfed" in irg:
        score += 30
    elif "good" in irg or "well" in irg or "full" in irg:
        score -= 20

    moisture = (soil_moisture or "").lower()
    if moisture == "low":
        score += 20
    elif moisture == "high":
        score -= 20
    return _clamp(score)


def heat_stress(temperature_c: float) -> float:
    """Continuous piecewise-linear heat stress.

    The Node version jumped from 30 at 30.0 degrees C to 40.8 at 30.1 because the
    sub-30 branch returned the raw temperature. The breakpoints below join up, so
    a tenth of a degree can no longer move the score by ten points.

        <= 20 C  ->  0
        20-30 C  ->  0 .. 40
        30-35 C  -> 40 .. 80
        > 35 C   -> 80 .. 100
    """
    t = temperature_c
    if t <= 20:
        return 0.0
    if t <= 30:
        return _clamp((t - 20) * 4.0)
    if t <= 35:
        return _clamp(40 + (t - 30) * 8.0)
    return _clamp(80 + (t - 35) * 4.0)


def rainfall_risk(rainfall_mm_7d: float) -> float:
    """Risk from recent rainfall, in millimetres over the trailing/forecast 7 days."""
    if rainfall_mm_7d < 5:
        return 60.0  # dry spell
    if rainfall_mm_7d > 150:
        return 80.0  # waterlogging / flood
    if rainfall_mm_7d > 80:
        return 40.0
    return 20.0


def disease_risk(label: str | None, confidence: float | None) -> float:
    """Convert a vision-model prediction into a risk contribution.

    A confident *healthy* reading lowers risk; it must never be read as
    "95% confident, therefore 95 risk", which is what the previous code did.
    """
    if label is None or confidence is None:
        return NEUTRAL_DISEASE_RISK
    normalized = label.strip().lower().replace("_", " ")
    if any(token in normalized for token in HEALTHY_LABELS):
        # Confident that nothing is wrong -> risk falls away from neutral.
        return _clamp(NEUTRAL_DISEASE_RISK * (1.0 - _clamp(confidence, 0.0, 1.0)))
    return _clamp(confidence * 100.0)


def vegetation_risk(ndvi: float | None) -> float:
    """Map NDVI 0.2 (bare) .. 0.8 (dense canopy) onto 100 .. 0 risk."""
    if ndvi is None:
        return NEUTRAL_VEGETATION_RISK
    return _clamp(round(100 - (ndvi - 0.2) * (100 / 0.6)))


def compute_risk(inputs: RiskInputs) -> RiskResult:
    assumptions: list[str] = []

    water = water_stress(inputs.irrigation, inputs.soil_moisture)
    if inputs.soil_moisture is None:
        assumptions.append(
            "Soil moisture was not recorded; water stress is based on the stated "
            "irrigation availability alone."
        )

    if inputs.weather_degraded or inputs.temperature_c is None:
        # Never let an unreachable weather API read as "0 degrees, no rain".
        heat = 0.0
        rain = 0.0
        assumptions.append(
            "Live weather was unavailable, so heat stress and rainfall risk are "
            "excluded from this score rather than assumed."
        )
        dropped = ("heat_stress", "rainfall_risk")
        active_weights = {k: v for k, v in WEIGHTS.items() if k not in dropped}
    else:
        heat = heat_stress(inputs.temperature_c)
        rain = rainfall_risk(inputs.rainfall_mm_7d or 0.0)
        active_weights = dict(WEIGHTS)

    disease = disease_risk(inputs.disease_label, inputs.disease_confidence)
    if inputs.disease_label is None:
        assumptions.append(
            f"No leaf analysis on record; disease risk uses the neutral baseline "
            f"({NEUTRAL_DISEASE_RISK:.0f}/100). Scan a leaf to replace it."
        )

    vegetation = vegetation_risk(inputs.ndvi)
    if inputs.ndvi is None:
        assumptions.append(
            f"No satellite NDVI for this farm; vegetation risk uses the neutral "
            f"baseline ({NEUTRAL_VEGETATION_RISK:.0f}/100)."
        )

    components = {
        "water_stress": water,
        "heat_stress": heat,
        "disease_risk": disease,
        "rainfall_risk": rain,
        "vegetation_risk": vegetation,
    }

    # Renormalize over the components that actually carry an observation, so
    # dropping weather lowers confidence rather than dragging the score to zero.
    total_weight = sum(active_weights.values())
    overall = sum(components[k] * w for k, w in active_weights.items()) / total_weight

    score = int(round(_clamp(overall)))
    if score <= 30:
        level: RiskLevel = "LOW"
    elif score <= 60:
        level = "MEDIUM"
    elif score <= 80:
        level = "HIGH"
    else:
        level = "CRITICAL"

    return RiskResult(
        water_stress=round(water, 1),
        heat_stress=round(heat, 1),
        rainfall_risk=round(rain, 1),
        disease_risk=round(disease, 1),
        vegetation_risk=round(vegetation, 1),
        overall_score=score,
        level=level,
        weights=active_weights,
        assumptions=assumptions,
    )
