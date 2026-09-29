"""Server-side speech endpoints (PRD F11, §13A Tier B).

The browser's Web Speech API is the default path and costs nothing. These exist for
the browsers that do not have it — Android WebView, Firefox on Android, most in-app
browsers — which is a large share of the devices this product targets.
"""

import structlog
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import get_settings
from app.integrations.speech import SpeechUnavailable, synthesize, transcribe
from app.schemas.voice import SynthesizeRequest

logger = structlog.get_logger(__name__)
router = APIRouter()
settings = get_settings()

MAX_AUDIO_BYTES = 2 * 1024 * 1024  # ~60 seconds of Opus


@router.get("/capabilities")
async def capabilities() -> dict:
    """Lets the client decide between the browser path and this one."""
    return {
        "server_speech_to_text": settings.cloud_speech_enabled,
        "server_text_to_speech": settings.cloud_speech_enabled,
        "languages": ["en", "hi", "gu", "te"],
    }


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form(default="en"),
) -> dict:
    payload = await audio.read(MAX_AUDIO_BYTES + 1)
    if len(payload) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Recording is too long. Keep it under a minute.")
    if not payload:
        raise HTTPException(400, "The recording is empty.")

    try:
        text = await transcribe(payload, language)
    except SpeechUnavailable as exc:
        raise HTTPException(
            503,
            "Server-side speech recognition is not available. Type your question instead.",
        ) from exc

    return {"transcript": text, "language": language, "source": "google-cloud-speech"}


@router.post("/synthesize")
async def synthesize_audio(payload: SynthesizeRequest) -> dict:
    try:
        audio_base64 = await synthesize(payload.text, payload.language)
    except SpeechUnavailable as exc:
        raise HTTPException(
            503,
            "Server-side speech synthesis is not available. The text is still shown on screen.",
        ) from exc

    return {
        "audio_base64": audio_base64,
        "mime_type": "audio/mpeg",
        "language": payload.language,
        "source": "google-cloud-texttospeech",
    }
