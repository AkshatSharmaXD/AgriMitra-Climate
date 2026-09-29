"""MongoDB connection lifecycle (Motor + Beanie ODM)."""

from __future__ import annotations

import logging

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_client: AsyncIOMotorClient | None = None
_connected = False


def is_connected() -> bool:
    """Whether the database is usable. Reported by /health and used by routes."""
    return _connected


async def connect_to_mongo() -> bool:
    """Connect, or log and carry on.

    A missing database disables the routes that store farms, but weather, satellite,
    crop suitability and the scheme directory are all stateless and keep working.
    Refusing to boot would take those down too, for no benefit.
    """
    global _client, _connected
    from beanie import init_beanie

    from app.models.documents import DOCUMENT_MODELS

    settings = get_settings()
    try:
        _client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=3000)
        await init_beanie(database=_client[settings.mongodb_db], document_models=DOCUMENT_MODELS)
    except Exception:
        logger.exception(
            "MongoDB unreachable at %s. Farm storage is disabled; stateless routes "
            "remain available.",
            settings.mongodb_uri,
        )
        _client = None
        _connected = False
        return False

    _connected = True
    logger.info("MongoDB connected: db=%s", settings.mongodb_db)
    return True


async def close_mongo_connection() -> None:
    global _client, _connected
    if _client is not None:
        _client.close()
        _client = None
    _connected = False
