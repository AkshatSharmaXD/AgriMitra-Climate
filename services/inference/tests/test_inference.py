"""Inference service tests."""

import io

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app import main
from app.main import app
from app.vision.leaf import prepare

client = TestClient(app)


def swatch(rgb: tuple[int, int, int], size: int = 400, fmt: str = "JPEG") -> bytes:
    array = np.full((size, size, 3), rgb, dtype=np.uint8)
    array = np.clip(
        array.astype(int) + np.random.RandomState(0).randint(-10, 10, array.shape), 0, 255
    ).astype(np.uint8)
    buffer = io.BytesIO()
    Image.fromarray(array).save(buffer, format=fmt)
    return buffer.getvalue()


def post(payload: bytes, content_type: str = "image/jpeg"):
    return client.post("/v1/predict", files={"file": ("leaf.jpg", payload, content_type)})


class TestUploadValidation:
    def test_rejects_unsupported_mime_type(self):
        response = client.post(
            "/v1/predict", files={"file": ("doc.pdf", b"not an image", "application/pdf")}
        )
        assert response.status_code == 415

    def test_rejects_oversized_upload(self):
        response = post(b"0" * (11 * 1024 * 1024))
        assert response.status_code == 413

    def test_rejects_empty_upload(self):
        assert post(b"").status_code == 400

    def test_corrupt_image_is_a_400_not_a_500(self):
        """A truncated file is the caller's problem; it must not read as a
        server fault, and must not come back as a 200 labelled "Error"."""
        response = post(b"\xff\xd8\xff\xe0 not really a jpeg")
        assert response.status_code == 400


class TestLeafDetection:
    """Regression tests for the bug that made this service useless.

    The colour gate masked a single green hue window, so every diseased leaf —
    the only kind anyone photographs for a disease scanner — scored a plant
    ratio of 0.0% and was rejected as "not a plant".
    """

    @pytest.mark.parametrize(
        "name,rgb",
        [
            ("healthy green", (62, 138, 54)),
            ("chlorotic yellow", (190, 200, 110)),
            ("rust orange-brown", (150, 80, 30)),
            ("late blight dark brown", (85, 55, 35)),
            ("necrosis dry tan", (170, 140, 95)),
            ("anthracnose near black", (45, 35, 28)),
            ("purple deficiency", (95, 60, 110)),
            ("red lesion", (165, 45, 35)),
        ],
    )
    def test_diseased_leaf_colours_are_accepted(self, name, rgb):
        frame = prepare(Image.open(io.BytesIO(swatch(rgb))))
        assert frame.is_leaf, f"{name} was rejected as not a leaf"

    @pytest.mark.parametrize(
        "name,rgb",
        [
            ("blue sky", (110, 160, 220)),
            ("grey concrete", (150, 150, 150)),
            ("white paper", (245, 245, 245)),
        ],
    )
    def test_obvious_non_leaves_are_still_rejected(self, name, rgb):
        frame = prepare(Image.open(io.BytesIO(swatch(rgb))))
        assert not frame.is_leaf, f"{name} was accepted as a leaf"

    def test_exif_orientation_is_applied(self):
        """Phone cameras record rotation in EXIF rather than rotating pixels.
        Unapplied, a portrait photo reaches the model on its side."""
        buffer = io.BytesIO()
        image = Image.new("RGB", (600, 300), (62, 138, 54))
        exif = image.getexif()
        exif[274] = 6  # rotate 90° clockwise
        image.save(buffer, format="JPEG", exif=exif)

        frame = prepare(Image.open(io.BytesIO(buffer.getvalue())))
        # Landscape source with orientation 6 must come back portrait.
        assert frame.image.height > frame.image.width

    def test_large_images_are_downscaled(self):
        frame = prepare(Image.open(io.BytesIO(swatch((62, 138, 54), size=3000))))
        assert max(frame.image.size) <= 1024


class TestPredictionFlow:
    def test_non_leaf_returns_a_labelled_rejection(self):
        response = post(swatch((150, 150, 150)))
        assert response.status_code == 200

        body = response.json()
        assert body["label"] == "not_a_plant"
        assert body["confidence"] is None
        assert body["source"] == "leaf-detector"

    def test_confident_prediction_is_returned_with_alternatives(self, monkeypatch):
        def fake_classifier(image, top_k=1):
            return [
                {"label": "Tomato___Early_blight", "score": 0.91},
                {"label": "Tomato___Late_blight", "score": 0.05},
            ][:top_k]

        monkeypatch.setattr(main, "CLASSIFIER", fake_classifier)
        response = post(swatch((62, 138, 54)))
        assert response.status_code == 200

        body = response.json()
        assert body["source"] == "mobilenet-v2"
        assert body["label"] == "Tomato — Early blight"
        assert body["confidence"] == pytest.approx(0.91)
        assert body["alternatives"][0]["label"] == "Tomato — Late blight"
        assert isinstance(body["elapsed_ms"], int)

    def test_low_confidence_escalates_and_keeps_the_best_guess(self, monkeypatch):
        def fake_classifier(image, top_k=1):
            return [{"label": "Tomato___Early_blight", "score": 0.41}][:top_k]

        monkeypatch.setattr(main, "CLASSIFIER", fake_classifier)
        response = post(swatch((62, 138, 54)))
        assert response.status_code == 200

        body = response.json()
        assert body["source"] != "mobilenet-v2"
        # The uncertain classifier reading is still surfaced, not discarded.
        assert body["classifier_best_guess"] == "Tomato — Early blight"
        assert body["classifier_confidence"] == pytest.approx(0.41)

    def test_classifier_crash_is_a_503_not_a_200(self, monkeypatch):
        """An inference failure must not come back as a successful diagnosis."""

        def exploding(image, top_k=1):
            raise RuntimeError("tensor shape mismatch")

        monkeypatch.setattr(main, "CLASSIFIER", exploding)
        assert post(swatch((62, 138, 54))).status_code == 503


class TestGuidance:
    @pytest.mark.parametrize(
        "label,expected",
        [
            ("Healthy Apple", "No disease signs"),
            ("Apple Scab", "fallen leaves"),
            ("Cedar Apple Rust", "pustules"),
            ("Cherry with Powdery Mildew", "airflow"),
            ("Tomato___Early_blight", "spreading dark patches"),
        ],
    )
    def test_guidance_matches_the_condition(self, label, expected):
        assert expected in main.guidance_for(label)

    @pytest.mark.parametrize(
        "label",
        ["Apple Scab", "Cedar Apple Rust", "Tomato___Late_blight", "Healthy Apple"],
    )
    def test_guidance_names_no_chemical_and_no_dosage(self, label):
        """PRD §19 forbids unsupported pesticide advice. The previous guidance
        named Mancozeb and Chlorothalonil outright."""
        text = main.guidance_for(label).lower()
        for chemical in ("mancozeb", "chlorothalonil", "ml/l", "grams per", "spray "):
            assert chemical not in text


class TestHealth:
    def test_reports_model_state(self):
        response = client.get("/health")
        assert response.status_code == 200

        body = response.json()
        assert body["model_loaded"] is (main.CLASSIFIER is not None)
        assert body["status"] == ("ok" if main.CLASSIFIER is not None else "degraded")

    def test_reports_supported_crops(self):
        response = client.get("/health")
        body = response.json()
        assert isinstance(body["supported_crops"], list)
        assert len(body["supported_crops"]) > 0
        assert "Corn" in body["supported_crops"]


class TestSupportedCrops:
    def test_predict_response_includes_supported_crops(self, monkeypatch):
        def fake_classifier(image, top_k=1):
            return [{"label": "Tomato___Early_blight", "score": 0.91}][:top_k]

        monkeypatch.setattr(main, "CLASSIFIER", fake_classifier)
        response = post(swatch((62, 138, 54)))
        body = response.json()
        assert isinstance(body["supported_crops"], list)
        assert len(body["supported_crops"]) > 0

    def test_uncertain_guidance_names_the_reason(self, monkeypatch):
        """The old copy only said 'try a closer photo', which is false when the
        real reason is an unsupported crop or a missing Gemini key."""
        monkeypatch.setattr(main, "CLASSIFIER", None)
        monkeypatch.setattr(main.settings, "gemini_api_key", None)
        response = post(swatch((62, 138, 54)))
        body = response.json()

        assert body["label"] == "uncertain"
        assert body["source"] == "unavailable"
        guidance = body["guidance"].lower()
        assert "trained on" in guidance or "supported" in guidance
        assert "not configured" in guidance
