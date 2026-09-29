"""Cloud Translation (PRD F10, §13A Tier B).

Why this exists: Gemini already answers in the farmer's language, but the curated
scheme directory in ``data/schemes.json`` is English-only static text. A farmer who
selected Hindi gets a Hindi advisory and then an English list of the subsidies they
might claim, which is the half of the product that involves money.

Translating static reference text is exactly what the Translation API is for, and
it is cheaper and more predictable than asking a language model to do it. Results
are cached because the source text never changes.
"""

from __future__ import annotations

import structlog

from app.core.config import get_settings
from app.integrations import cache

logger = structlog.get_logger(__name__)

TTL = 30 * 86_400  # the source text is static; a month is conservative


class TranslationUnavailable(RuntimeError):
    """Raised when Cloud Translation is not configured or the call failed."""


async def translate(texts: list[str], target_language: str) -> list[str]:
    """Translate a batch. Returns the input unchanged for English or on failure.

    Returning the source text rather than raising is deliberate: an untranslated
    scheme name is useful, a missing scheme is not.
    """
    if target_language == "en" or not texts:
        return texts

    settings = get_settings()
    if not settings.translation_enabled:
        return texts

    keys = [cache.geo_key("tr", 0, 0, target_language, str(hash(text))) for text in texts]
    cached = [await cache.get(key) for key in keys]
    if all(value is not None for value in cached):
        return [str(value) for value in cached]

    try:
        import anyio
        from google.cloud import translate_v2

        def _run() -> list[str]:
            client = translate_v2.Client()
            results = client.translate(
                texts, target_language=target_language, source_language="en", format_="text"
            )
            if isinstance(results, dict):
                results = [results]
            return [item["translatedText"] for item in results]

        translated = await anyio.to_thread.run_sync(_run)
    except Exception as exc:
        logger.warning("translation_failed", error=str(exc), target=target_language)
        return texts

    for key, value in zip(keys, translated, strict=False):
        await cache.set(key, value, TTL)
    return translated
