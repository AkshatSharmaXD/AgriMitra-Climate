"""Regression tests for the farm risk engine.

Each test below pins a behaviour that the previous Node implementation got wrong.
"""

import pytest

from app.domain.risk import RiskInputs, compute_risk, disease_risk, heat_stress


class TestDiseaseRisk:
    def test_confident_healthy_reading_lowers_risk(self):
        """A 0.95-confidence 'healthy' used to produce a disease risk of 95."""
        assert disease_risk("healthy", 0.95) < 5

    def test_rejected_non_plant_image_does_not_max_out_risk(self):
        """The inference service returns confidence 1.0 for 'Not a plant'."""
        assert disease_risk("Not a plant", 1.0) == 0

    def test_confident_disease_raises_risk(self):
        assert disease_risk("Tomato___Early_blight", 0.87) == pytest.approx(87.0)

    def test_underscored_healthy_label_is_recognised(self):
        assert disease_risk("Potato___healthy", 0.9) < 5

    def test_missing_reading_uses_neutral_baseline(self):
        assert disease_risk(None, None) == 30.0


class TestHeatStress:
    def test_is_continuous_across_the_30c_breakpoint(self):
        """The old piecewise function jumped ~10 points between 30.0 and 30.1."""
        assert abs(heat_stress(30.0) - heat_stress(30.1)) < 1.0

    def test_is_continuous_across_the_35c_breakpoint(self):
        assert abs(heat_stress(35.0) - heat_stress(35.1)) < 1.0

    def test_is_monotonic(self):
        values = [heat_stress(t) for t in range(0, 51)]
        assert values == sorted(values)

    def test_cold_weather_is_not_heat_stress(self):
        assert heat_stress(12.0) == 0.0

    def test_extreme_heat_saturates_at_100(self):
        assert heat_stress(60.0) == 100.0


class TestCompute:
    def test_degraded_weather_is_excluded_not_zeroed(self):
        """A dead weather API must not read as '0 degrees and no rain'."""
        degraded = compute_risk(
            RiskInputs(irrigation="Limited irrigation", weather_degraded=True)
        )
        assert degraded.heat_stress == 0.0
        assert "heat_stress" not in degraded.weights
        assert any("weather was unavailable" in note.lower() for note in degraded.assumptions)

    def test_degraded_weather_does_not_collapse_the_overall_score(self):
        degraded = compute_risk(
            RiskInputs(irrigation="Limited irrigation", weather_degraded=True)
        )
        healthy = compute_risk(
            RiskInputs(irrigation="Limited irrigation", temperature_c=25.0, rainfall_mm_7d=40.0)
        )
        # Dropping two low-risk components must not make the farm look safer.
        assert degraded.overall_score >= healthy.overall_score

    def test_assumptions_are_recorded_for_every_missing_signal(self):
        result = compute_risk(RiskInputs(irrigation="Rainfed", temperature_c=28.0))
        assert len(result.assumptions) == 3  # soil moisture, disease, ndvi

    def test_levels_follow_the_prd_bands(self):
        assert compute_risk(
            RiskInputs(
                irrigation="Good irrigation",
                soil_moisture="High",
                temperature_c=18.0,
                rainfall_mm_7d=30.0,
                ndvi=0.78,
                disease_label="healthy",
                disease_confidence=0.95,
            )
        ).level == "LOW"

        assert compute_risk(
            RiskInputs(
                irrigation="Rainfed",
                soil_moisture="Low",
                temperature_c=44.0,
                rainfall_mm_7d=0.0,
                ndvi=0.21,
                disease_label="Wheat___Leaf_Rust",
                disease_confidence=0.96,
            )
        ).level == "CRITICAL"

    def test_score_is_bounded(self):
        for temp in (-20.0, 0.0, 25.0, 55.0):
            result = compute_risk(RiskInputs(irrigation="Rainfed", temperature_c=temp))
            assert 0 <= result.overall_score <= 100
