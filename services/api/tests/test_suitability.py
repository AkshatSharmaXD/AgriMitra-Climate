"""Regression tests for the crop suitability engine."""

from app.domain.suitability import FarmContext, rank_crops, score_crop

WHEAT = {
    "crop": "Wheat",
    "season": ["Rabi"],
    "soil": ["Loamy", "Clay Loam", "Sandy Loam"],
    "waterRequirement": "Moderate",
    "temperatureRange": {"min": 10, "max": 25},
    "rainfallRequirement": {"min": 400, "max": 1000},
}


class TestRainfallUnits:
    def test_missing_seasonal_rainfall_is_unscored_not_failed(self):
        """The old code compared an hourly reading against a seasonal requirement,
        so every crop lost the rainfall point. An unknown must not be a failure."""
        result = score_crop(
            WHEAT,
            FarmContext(
                season="Rabi",
                soil_type="Loamy",
                irrigation="Good irrigation",
                temperature_c=20.0,
            ),
        )
        assert "rainfall" in result.unscored_criteria
        assert all(c.criterion != "rainfall" for c in result.criteria)
        # Scored out of the 4 criteria that had evidence, not penalised for the 5th.
        assert result.match_percentage == 100

    def test_limited_irrigation_costs_only_the_water_criterion(self):
        result = score_crop(
            WHEAT,
            FarmContext(
                season="Rabi", soil_type="Loamy", irrigation="Limited", temperature_c=20.0
            ),
        )
        assert result.match_percentage == 88  # 3.5 of 4

    def test_seasonal_rainfall_inside_band_scores_full(self):
        result = score_crop(
            WHEAT,
            FarmContext(
                season="Rabi",
                soil_type="Loamy",
                irrigation="Good irrigation",
                temperature_c=20.0,
                seasonal_rainfall_mm=620.0,
            ),
        )
        rainfall = next(c for c in result.criteria if c.criterion == "rainfall")
        assert rainfall.points == 1.0
        assert result.match_percentage == 100

    def test_severe_shortfall_scores_zero_on_rainfall(self):
        result = score_crop(
            WHEAT,
            FarmContext(
                season="Rabi",
                soil_type="Loamy",
                irrigation="Good irrigation",
                temperature_c=20.0,
                seasonal_rainfall_mm=40.0,
            ),
        )
        rainfall = next(c for c in result.criteria if c.criterion == "rainfall")
        assert rainfall.points == 0.0


class TestRanking:
    def test_ranking_is_ordered_and_deterministic(self):
        ctx = FarmContext(
            season="Rabi",
            soil_type="Loamy",
            irrigation="Limited irrigation",
            temperature_c=20.0,
            seasonal_rainfall_mm=420.0,
        )
        first = rank_crops(ctx)
        assert [c.match_percentage for c in first] == sorted(
            (c.match_percentage for c in first), reverse=True
        )
        assert [c.crop for c in first] == [c.crop for c in rank_crops(ctx)]

    def test_out_of_season_crop_ranks_below_in_season_crop(self):
        ctx = FarmContext(
            season="Rabi",
            soil_type="Loamy",
            irrigation="Limited irrigation",
            temperature_c=20.0,
            seasonal_rainfall_mm=420.0,
        )
        scores = {c.crop: c.match_percentage for c in rank_crops(ctx)}
        assert scores["Mustard"] > scores["Rice"]

    def test_every_criterion_carries_an_explanation(self):
        ctx = FarmContext(
            season="Rabi", soil_type="Sandy", irrigation="Rainfed", temperature_c=31.0
        )
        for crop in rank_crops(ctx):
            assert all(c.explanation.strip() for c in crop.criteria)
