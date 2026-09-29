"""MongoDB connection lifecycle (Motor + Beanie ODM)."""

from __future__ import annotations

import logging

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:
    global _client
    from beanie import init_beanie

    from app.models.documents import DOCUMENT_MODELS

    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
    await init_beanie(database=_client[settings.mongodb_db], document_models=DOCUMENT_MODELS)
    logger.info("MongoDB connected: db=%s", settings.mongodb_db)


async def close_mongo_connection() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
