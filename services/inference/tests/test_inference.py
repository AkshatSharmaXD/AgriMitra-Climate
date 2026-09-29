import io

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)

def create_test_image(size=(224, 224), color=(0, 255, 0), format="JPEG"):
    """Create a dummy image for testing."""
    image = Image.new("RGB", size, color)
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=format)
    img_byte_arr.seek(0)
    return img_byte_arr.read()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()

def test_predict_oversized_upload():
    # 11MB file to trigger the limit
    large_content = b"0" * (11 * 1024 * 1024)
    response = client.post(
        "/v1/predict",
        files={"file": ("large_image.jpg", large_content, "image/jpeg")}
    )
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]

def test_predict_invalid_mime_type():
    response = client.post(
        "/v1/predict",
        files={"file": ("document.pdf", b"dummy pdf content", "application/pdf")}
    )
    assert response.status_code == 415
    assert "Unsupported file type" in response.json()["detail"]

def test_predict_non_plant_rejection():
    # A plain black image will likely trigger the "not a plant" check (ratio < 0.02)
    img_bytes = create_test_image(color=(0, 0, 0))
    response = client.post(
        "/v1/predict",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["label"] == "not_a_plant"
    assert data["confidence"] is None

def test_predict_confident():
    # A green image might be treated as a plant. We mock the classifier.
    # Since the classifier loads lazily in startup, or we just let it use the real pipeline.
    # To test without hitting real models, we should mock CLASSIFIER.
    from app import main
    
    # Mock the classifier function
    def mock_classifier(img):
        return [{"score": 0.85, "label": "Early_blight"}]
    
    original_classifier = main.CLASSIFIER
    main.CLASSIFIER = mock_classifier
    
    img_bytes = create_test_image(color=(30, 200, 30))
    response = client.post(
        "/v1/predict",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    
    main.CLASSIFIER = original_classifier
    
    assert response.status_code == 200
    data = response.json()
    assert data["label"] == "Early blight"
    assert data["confidence"] == 0.85
    assert "source" in data
    assert data["source"] == "mobilenet-v2"

def test_predict_low_confidence_fallback():
    from app import main
    
    # Mock the classifier function to return low confidence
    def mock_classifier(img):
        return [{"score": 0.50, "label": "Apple_scab"}]
    
    original_classifier = main.CLASSIFIER
    main.CLASSIFIER = mock_classifier
    
    # Also mock Gemini fallback
    async def mock_analyze(*args, **kwargs):
        return {
            "label": "Some Disease",
            "confidence": 0.95,
            "guidance": "Gemini guidance",
            "source": "gemini-vision"
        }
        
    original_analyze = main.analyze_with_gemini
    main.analyze_with_gemini = mock_analyze
    
    img_bytes = create_test_image(color=(30, 200, 30))
    response = client.post(
        "/v1/predict",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    
    main.CLASSIFIER = original_classifier
    main.analyze_with_gemini = original_analyze
    
    assert response.status_code == 200
    data = response.json()
    assert data["label"] == "Some Disease"
    assert data["confidence"] == 0.95
    assert data["source"] == "gemini-vision"
