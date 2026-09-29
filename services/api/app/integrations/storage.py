"""Google Cloud Storage for farmer-submitted leaf images (PRD §13A Tier A, §15).

Why this exists: ``DiseaseAnalysis`` records a diagnosis but, until now, threw the
photograph away. An extension officer reviewing a flagged farm has no way to see
what the model actually looked at, and a wrong call cannot be audited. The image
is the evidence behind the label.

Degradation: with no bucket configured the diagnosis still runs and is still
stored — only ``image_ref`` is left empty, and the API says so. An upload failure
is never allowed to fail the farmer's scan.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

import structlog

from app.core.config import get_settings

logger = structlog.get_logger(__name__)

EXTENSIONS = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


class StorageUnavailable(RuntimeError):
    """Raised when no bucket is configured or the upload could not complete."""


def _client():
    from google.cloud import storage

    # Application Default Credentials: the Cloud Run service account in
    # production, `gcloud auth application-default login` locally. No key file.
    return storage.Client()


async def store_leaf_image(
    payload: bytes,
    content_type: str,
    farm_id: str | None,
) -> str:
    """Upload one image and return its ``gs://`` reference.

    Objects are laid out by farm and date so a district officer can list what a
    single farm submitted over a season.
    """
    settings = get_settings()
    if not settings.configured(settings.gcs_bucket):
        raise StorageUnavailable("No GCS bucket configured")

    extension = EXTENSIONS.get(content_type, "bin")
    today = datetime.now(UTC).strftime("%Y/%m/%d")
    name = f"leaf-scans/{farm_id or 'unattached'}/{today}/{uuid.uuid4().hex}.{extension}"

    try:
        import anyio

        def _upload() -> None:
            bucket = _client().bucket(settings.gcs_bucket)
            blob = bucket.blob(name)
            blob.upload_from_string(payload, content_type=content_type)

        # The GCS client is synchronous; run it off the event loop so one upload
        # cannot stall every other request (see the no-blocking-I/O rule).
        await anyio.to_thread.run_sync(_upload)
    except Exception as exc:
        logger.warning("gcs_upload_failed", error=str(exc), object_name=name)
        raise StorageUnavailable(str(exc)) from exc

    logger.info("gcs_upload_ok", object_name=name, bytes=len(payload))
    return f"gs://{settings.gcs_bucket}/{name}"


async def signed_url(object_ref: str, ttl_seconds: int = 900) -> str | None:
    """A short-lived read URL for an object, for officer review.

    Returns ``None`` rather than raising: a missing preview must never break the
    page that lists diagnoses.
    """
    settings = get_settings()
    if not object_ref.startswith("gs://") or not settings.configured(settings.gcs_bucket):
        return None

    _, _, remainder = object_ref.partition("gs://")
    bucket_name, _, blob_name = remainder.partition("/")

    try:
        from datetime import timedelta

        import anyio

        def _sign() -> str:
            blob = _client().bucket(bucket_name).blob(blob_name)
            return blob.generate_signed_url(
                version="v4", expiration=timedelta(seconds=ttl_seconds), method="GET"
            )

        return await anyio.to_thread.run_sync(_sign)
    except Exception as exc:
        logger.warning("gcs_sign_failed", error=str(exc), object_ref=object_ref)
        return None
