"""MongoDB connection lifecycle (Motor + Beanie ODM).

Targets MongoDB Atlas. Two consequences shape this module:

* Atlas is across the public internet, so the connection can fail at startup for
  reasons that clear on their own — a cold shared-tier cluster, a DNS hiccup, a
  brief network partition. Deciding connectivity once at boot would leave the API
  permanently degraded after a blip that lasted seconds.
* A failed connection must not take down the stateless routes (weather, satellite,
  crop suitability, schemes), which need no database at all.

So the connection is attempted at startup, and afterwards re-attempted in the
background whenever a request finds it down. The request itself never waits on
that retry — it gets an immediate, honest 503.
"""

from __future__ import annotations

import asyncio
import logging
import time

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_connected = False
_started = False
_last_attempt = 0.0
_reconnecting: asyncio.Task[None] | None = None

# Minimum gap between background reconnect attempts, so an outage does not turn
# into a reconnect storm against the cluster.
RECONNECT_COOLDOWN_SECONDS = 15.0


def is_connected() -> bool:
    """Current known state. Never blocks."""
    return _connected


async def _attempt_connection() -> bool:
    global _client, _connected, _last_attempt

    from beanie import init_beanie

    from app.models.documents import DOCUMENT_MODELS

    settings = get_settings()
    _last_attempt = time.monotonic()

    try:
        _client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=settings.mongodb_timeout_ms,
            connectTimeoutMS=settings.mongodb_timeout_ms,
            maxPoolSize=settings.mongodb_max_pool_size,
            retryWrites=True,
            appname="agrimitra-api",
        )
        await init_beanie(database=_client[settings.mongodb_db], document_models=DOCUMENT_MODELS)
    except Exception as exc:
        # The URI carries a password — log the exception type and message, and let
        # the traceback stay in the debug log rather than echoing credentials.
        logger.warning(
            "MongoDB unavailable (%s: %s). Stored-record routes will return 503; "
            "stateless routes are unaffected.",
            type(exc).__name__,
            exc,
        )
        if _client is not None:
            _client.close()
        _client = None
        _connected = False
        return False

    _connected = True
    logger.info("MongoDB connected: db=%s", settings.mongodb_db)
    return True


async def connect_to_mongo() -> bool:
    """Startup connection. Returns success; never raises."""
    global _started
    _started = True
    return await _attempt_connection()


def schedule_reconnect() -> None:
    """Kick off a background reconnect if one is not already running.

    Fire and forget by design: the caller is serving a request and must not be
    made to wait out a 10-second server-selection timeout.
    """
    global _reconnecting

    if _connected or not _started:
        return
    if _reconnecting is not None and not _reconnecting.done():
        return
    if time.monotonic() - _last_attempt < RECONNECT_COOLDOWN_SECONDS:
        return

    async def _run() -> None:
        await _attempt_connection()

    try:
        _reconnecting = asyncio.create_task(_run())
    except RuntimeError:
        # No running loop (e.g. a sync context in tests) — nothing to schedule.
        _reconnecting = None


async def close_mongo_connection() -> None:
    global _client, _connected, _started, _reconnecting

    if _reconnecting is not None and not _reconnecting.done():
        _reconnecting.cancel()
    _reconnecting = None

    if _client is not None:
        _client.close()
        _client = None

    _connected = False
    _started = False
