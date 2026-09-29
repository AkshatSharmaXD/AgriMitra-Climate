"""Cloud Speech-to-Text and Text-to-Speech (PRD F11, §13A Tier B).

Why a server path when the browser already has the Web Speech API: the Web Speech
API is not available in every browser a farmer will actually use. Android WebView,
Firefox on Android and most in-app browsers have no `SpeechRecognition` at all, and
Gujarati and Telugu recognition quality varies sharply between engines. Cloud
Speech gives a uniform path for the languages this product promises.

The browser remains the default because it costs nothing and needs no round trip.
This is the fallback, selected by the client when `SpeechRecognition` is missing.
"""

from __future__ import annotations

import base64

import structlog

from app.core.config import get_settings

logger = structlog.get_logger(__name__)

# Cloud Speech language codes for the languages the product ships.
RECOGNITION_LOCALE = {"en": "en-IN", "hi": "hi-IN", "gu": "gu-IN", "te": "te-IN"}

# Voices chosen per language; Indian-English and Hindi have WaveNet coverage,
# Gujarati and Telugu fall back to the standard voices that exist.
VOICE = {
    "en": ("en-IN", "en-IN-Wavenet-A"),
    "hi": ("hi-IN", "hi-IN-Wavenet-A"),
    "gu": ("gu-IN", "gu-IN-Standard-A"),
    "te": ("te-IN", "te-IN-Standard-A"),
}


class SpeechUnavailable(RuntimeError):
    """Raised when Cloud Speech is not configured or the call failed."""


def _enabled() -> bool:
    return get_settings().cloud_speech_enabled


async def transcribe(audio: bytes, language: str, encoding: str = "WEBM_OPUS") -> str:
    """Speech to text. Returns the transcript, or raises."""
    if not _enabled():
        raise SpeechUnavailable("Cloud Speech-to-Text is not enabled on this server")

    try:
        import anyio
        from google.cloud import speech

        def _run() -> str:
            client = speech.SpeechClient()
            response = client.recognize(
                config=speech.RecognitionConfig(
                    encoding=getattr(speech.RecognitionConfig.AudioEncoding, encoding),
                    language_code=RECOGNITION_LOCALE.get(language, "en-IN"),
                    enable_automatic_punctuation=True,
                    model="latest_short",
                ),
                audio=speech.RecognitionAudio(content=audio),
            )
            for result in response.results:
                if result.alternatives:
                    return result.alternatives[0].transcript.strip()
            return ""

        transcript = await anyio.to_thread.run_sync(_run)
    except Exception as exc:
        logger.warning("stt_failed", error=str(exc), language=language)
        raise SpeechUnavailable(str(exc)) from exc

    if not transcript:
        raise SpeechUnavailable("No speech was recognised in the recording")
    return transcript


async def synthesize(text: str, language: str) -> str:
    """Text to speech. Returns base64 MP3 the browser can play directly."""
    if not _enabled():
        raise SpeechUnavailable("Cloud Text-to-Speech is not enabled on this server")

    language_code, voice_name = VOICE.get(language, VOICE["en"])

    try:
        import anyio
        from google.cloud import texttospeech

        def _run() -> bytes:
            client = texttospeech.TextToSpeechClient()
            response = client.synthesize_speech(
                input=texttospeech.SynthesisInput(text=text),
                voice=texttospeech.VoiceSelectionParams(
                    language_code=language_code, name=voice_name
                ),
                audio_config=texttospeech.AudioConfig(
                    audio_encoding=texttospeech.AudioEncoding.MP3,
                    # Slightly slower than default: this is read aloud in a field,
                    # often over ambient noise.
                    speaking_rate=0.92,
                ),
            )
            return response.audio_content

        audio = await anyio.to_thread.run_sync(_run)
    except Exception as exc:
        logger.warning("tts_failed", error=str(exc), language=language)
        raise SpeechUnavailable(str(exc)) from exc

    return base64.b64encode(audio).decode("ascii")
