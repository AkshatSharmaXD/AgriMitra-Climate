"""BigQuery district analytics and Pub/Sub refresh fan-out (PRD §13A Tier B).

**BigQuery.** The district roll-up in ``app/domain/districts.py`` reads every farm
and every risk document and aggregates them in Python. That is correct and fast at
100 farms. It is the wrong shape at 100,000: the PRD's stated architecture is
farmer to district to state, and a state agriculture department asking "show water
stress by district by week for the last three seasons" is an analytical query, not
an application query. Risk snapshots are streamed here as they are computed, so the
warehouse holds the time series MongoDB is not the right store for.

MongoDB stays the system of record. BigQuery is a derived, append-only copy — if
the stream fails, nothing the farmer sees is affected.

**Pub/Sub.** Refreshing NDVI for every farm is a slow fan-out of Earth Engine
reductions. Doing it inside a request would block it for minutes. Publishing one
message per farm lets a Cloud Functions subscriber work through them, which is
also what makes a nightly Cloud Scheduler refresh possible.
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any

import structlog

from app.core.config import get_settings

logger = structlog.get_logger(__name__)

RISK_TABLE = "farm_risk_snapshots"


async def stream_risk_snapshot(
    farm_id: str,
    district: str,
    state: str,
    crop: str,
    risk: dict[str, Any],
) -> bool:
    """Append one computed risk to the warehouse. Never raises.

    Returns whether the row was written, so callers can report it honestly rather
    than assuming success.
    """
    settings = get_settings()
    if not settings.bigquery_enabled:
        return False

    row = {
        "farm_id": farm_id,
        "district": district,
        "state": state,
        "crop": crop,
        "overall_score": risk["overall_score"],
        "level": risk["level"],
        "water_stress": risk["water_stress"],
        "heat_stress": risk["heat_stress"],
        "rainfall_risk": risk["rainfall_risk"],
        "disease_risk": risk["disease_risk"],
        "vegetation_risk": risk["vegetation_risk"],
        # Which factors actually carried evidence. Without this a later analyst
        # cannot tell a real low score from one computed with weather missing.
        "scored_factors": json.dumps(sorted(risk["weights"].keys())),
        "assumption_count": len(risk.get("assumptions", [])),
        "computed_at": datetime.now(UTC).isoformat(),
    }

    try:
        import anyio
        from google.cloud import bigquery

        def _insert() -> list[Any]:
            client = bigquery.Client(project=settings.gcp_project)
            table = f"{settings.gcp_project}.{settings.bigquery_dataset}.{RISK_TABLE}"
            return client.insert_rows_json(table, [row])

        errors = await anyio.to_thread.run_sync(_insert)
    except Exception as exc:
        logger.warning("bigquery_stream_failed", error=str(exc), farm_id=farm_id)
        return False

    if errors:
        logger.warning("bigquery_stream_rejected", errors=str(errors), farm_id=farm_id)
        return False
    return True


async def publish_ndvi_refresh(farm_ids: list[str]) -> int:
    """Queue farms for an out-of-band NDVI refresh. Returns how many were queued."""
    settings = get_settings()
    if not settings.pubsub_enabled or not farm_ids:
        return 0

    try:
        import anyio
        from google.cloud import pubsub_v1

        def _publish() -> int:
            publisher = pubsub_v1.PublisherClient()
            topic = publisher.topic_path(
                settings.gcp_project, settings.pubsub_topic_ndvi_refresh
            )
            futures = [
                publisher.publish(topic, json.dumps({"farm_id": farm_id}).encode("utf-8"))
                for farm_id in farm_ids
            ]
            for future in futures:
                future.result(timeout=30)
            return len(futures)

        published = await anyio.to_thread.run_sync(_publish)
    except Exception as exc:
        logger.warning("pubsub_publish_failed", error=str(exc), count=len(farm_ids))
        return 0

    logger.info("pubsub_published", count=published)
    return published
