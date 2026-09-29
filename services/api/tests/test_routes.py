"""Route-level tests for everything that does not require a database."""

import pytest

from app.core.config import get_settings
from app.integrations import satellite as satellite_module


class TestHealth:
    async def test_reports_capabilities_truthfully(self, client):
        response = await client.get("/health")
        assert response.status_code == 200

        body = response.json()
        assert body["status"] == "ok"
        # Capabilities must mirror config, not be hardcoded optimistically —
        # the UI badges data provenance from this.
        settings = get_settings()
        assert body["capabilities"]["gemini"] is settings.gemini_enabled
        assert body["capabilities"]["earth_engine"] is settings.earth_engine_enabled

    async def test_sets_security_headers(self, client):
        response = await client.get("/health")
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"


class TestValidation:
    @pytest.mark.parametrize(
        "query",
        [
            "",                       # nothing supplied
            "?lat=27.5",              # half a coordinate
            "?lat=abc&lng=76.6",      # not a number
            "?lat=200&lng=76.6",      # out of range
            "?lat=27.5&lng=400",
        ],
    )
    async def test_weather_rejects_bad_coordinates(self, client, query):
        assert (await client.get(f"/api/v1/weather{query}")).status_code == 422

    async def test_satellite_rejects_bad_coordinates(self, client):
        assert (await client.get("/api/v1/satellite?lat=91&lng=0")).status_code == 422

    async def test_seasonal_rainfall_rejects_unknown_season(self, client):
        response = await client.get(
            "/api/v1/weather/seasonal-rainfall?lat=27.5&lng=76.6&season=Monsoon"
        )
        assert response.status_code == 422

    @pytest.mark.parametrize(
        "payload",
        [
            {},
            {"season": "Rabi"},                                   # no soil
            {"season": "Winter", "soil_type": "Loamy", "irrigation": "Limited"},
            # An hourly precipitation value is fine numerically; a negative one is not.
            {
                "season": "Rabi",
                "soil_type": "Loamy",
                "irrigation": "Limited",
                "seasonal_rainfall_mm": -5,
            },
        ],
    )
    async def test_recommendations_reject_invalid_context(self, client, payload):
        response = await client.post("/api/v1/recommendations/crops", json=payload)
        assert response.status_code == 422


class TestRecommendations:
    async def test_ranks_crops_and_always_returns_the_disclaimer(self, client):
        response = await client.post(
            "/api/v1/recommendations/crops",
            json={"season": "Rabi", "soil_type": "Loamy", "irrigation": "Good irrigation"},
        )
        assert response.status_code == 200

        body = response.json()
        assert len(body["recommendations"]) == 10
        assert "not validated agronomic advice" in body["disclaimer"]

        scores = [item["match_percentage"] for item in body["recommendations"]]
        assert scores == sorted(scores, reverse=True)

    async def test_missing_rainfall_is_reported_unscored_not_failed(self, client):
        """Audit B3: an unknown must never read as a failed criterion."""
        response = await client.post(
            "/api/v1/recommendations/crops",
            json={"season": "Rabi", "soil_type": "Loamy", "irrigation": "Good irrigation"},
        )
        for crop in response.json()["recommendations"]:
            assert "rainfall" in crop["unscored_criteria"]
            assert all(c["criterion"] != "rainfall" for c in crop["criteria"])


class TestSatelliteProvenance:
    async def test_demo_data_is_labelled_as_not_live(self, client, monkeypatch):
        """Audit A1: seeded values must never claim to be a live observation."""
        monkeypatch.setattr(
            satellite_module, "get_provider", lambda: satellite_module.SeededDemoProvider()
        )
        response = await client.get("/api/v1/satellite?lat=27.55&lng=76.63&district=Alwar")
        assert response.status_code == 200

        body = response.json()
        assert body["is_live"] is False
        assert body["source"] == "seeded-demo"
        assert "not a live satellite observation" in body["notice"]

    async def test_uncovered_location_404s_rather_than_inventing_a_reading(
        self, client, monkeypatch
    ):
        monkeypatch.setattr(
            satellite_module, "get_provider", lambda: satellite_module.SeededDemoProvider()
        )
        response = await client.get("/api/v1/satellite?lat=12.9&lng=77.6&district=Bengaluru")
        assert response.status_code == 404


class TestSchemes:
    async def test_returns_national_schemes_with_a_disclaimer(self, client):
        response = await client.get("/api/v1/schemes")
        assert response.status_code == 200

        body = response.json()
        assert len(body["schemes"]) > 0
        assert all(item["scope"] == "National" for item in body["schemes"])
        assert "Confirm eligibility" in body["disclaimer"]

    async def test_state_filter_adds_state_schemes(self, client):
        states = (await client.get("/api/v1/schemes")).json()["states_available"]
        if not states:
            pytest.skip("no state-specific schemes in the dataset")

        response = await client.get(f"/api/v1/schemes?state={states[0]}")
        assert any(item["scope"] == states[0] for item in response.json()["schemes"])


class TestMarket:
    async def test_returns_503_rather_than_an_invented_price(self, client):
        """Audit A7/A2: no key means no price, never an estimated one."""
        if get_settings().market_data_enabled:
            pytest.skip("a real data.gov.in key is configured")

        response = await client.get("/api/v1/market")
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"]


class TestAdvisoryFallback:
    async def test_fallback_is_labelled_as_not_ai_generated(self, client):
        """When Gemini is absent the response must not pose as model output."""
        if get_settings().gemini_enabled:
            pytest.skip("a real Gemini key is configured")

        response = await client.post(
            "/api/v1/advisory",
            json={
                "location": "Alwar, Rajasthan",
                "crop": "Wheat",
                "season": "Rabi",
                "soil_type": "Loamy",
                "irrigation": "Limited irrigation",
                "risk_level": "MEDIUM",
                "risk_score": 52,
            },
        )
        assert response.status_code == 200

        body = response.json()
        assert body["is_ai_generated"] is False
        assert body["source"] == "deterministic-fallback"
        assert "not" in body["uncertainty"].lower()


class TestDatabaseDegradation:
    """With MongoDB down, stateless routes keep working and stored-data routes
    say so in a sentence — not with a bare 500 (`writing.md`)."""

    @pytest.mark.parametrize(
        "method,path",
        [
            ("get", "/api/v1/districts/overview"),
            ("get", "/api/v1/districts/summary"),
            ("get", "/api/v1/farms/650000000000000000000000"),
            ("post", "/api/v1/farmers"),
        ],
    )
    async def test_stored_data_routes_return_503_with_an_explanation(
        self, client, method, path
    ):
        response = await getattr(client, method)(path) if method == "get" else await client.post(
            path, json={}
        )
        assert response.status_code == 503
        detail = response.json()["detail"]
        assert "database is unavailable" in detail
        assert "still work" in detail

    @pytest.mark.parametrize(
        "path",
        [
            "/api/v1/satellite?lat=27.55&lng=76.63&district=Alwar",
            "/api/v1/schemes",
        ],
    )
    async def test_stateless_routes_are_unaffected(self, client, path):
        assert (await client.get(path)).status_code == 200


class TestSchemeTranslation:
    async def test_language_field_reports_what_was_actually_returned(self, client):
        """Asking for Hindi with Translation disabled must report `en`, not `hi`.

        Claiming a translation that did not happen is the same class of dishonesty
        as labelling demo data live.
        """
        response = await client.get("/api/v1/schemes?language=hi")
        assert response.status_code == 200

        body = response.json()
        if not get_settings().translation_enabled:
            assert body["language"] == "en"

    async def test_rejects_an_unsupported_language(self, client):
        assert (await client.get("/api/v1/schemes?language=fr")).status_code == 422


class TestVoiceCapabilities:
    async def test_reports_server_speech_honestly(self, client):
        response = await client.get("/api/v1/voice/capabilities")
        assert response.status_code == 200

        body = response.json()
        settings = get_settings()
        assert body["server_speech_to_text"] is settings.cloud_speech_enabled
        assert set(body["languages"]) == {"en", "hi", "gu", "te"}

    async def test_synthesize_503s_when_not_configured(self, client):
        if get_settings().cloud_speech_enabled:
            pytest.skip("Cloud Speech is configured")

        response = await client.post(
            "/api/v1/voice/synthesize", json={"text": "Irrigate today", "language": "hi"}
        )
        assert response.status_code == 503
        assert "still shown on screen" in response.json()["detail"]
