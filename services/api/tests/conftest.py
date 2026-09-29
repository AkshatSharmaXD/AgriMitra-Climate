"""Test fixtures.

The app is exercised through an in-process ASGI transport with the lifespan
disabled, so route behaviour can be verified without a MongoDB instance. Routes
that touch the database are covered separately against a live database.
"""

import os
import pytest
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import pytest_asyncio

from app.main import app
from app.core.config import get_settings
from app.models.documents import DOCUMENT_MODELS

@pytest_asyncio.fixture(scope="session")
async def db():
    settings = get_settings()
    # Ensure we use a test database
    test_db_name = "agrimitra_test"
    
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[test_db_name]
    
    # Drop all collections before tests
    collections = await db.list_collection_names()
    for col in collections:
        await db.drop_collection(col)
        
    # Init beanie so indexes are created
    await init_beanie(database=db, document_models=DOCUMENT_MODELS)
    
    yield db
    
    # Cleanup after tests
    collections = await db.list_collection_names()
    for col in collections:
        await db.drop_collection(col)
    client.close()

@pytest_asyncio.fixture
async def client(db) -> AsyncClient:
    # Use real lifespan so it attempts to connect? 
    # Actually, we already connected beanie above. If we use lifespan it might reconnect to the real DB.
    # Let's override the config so it uses the test DB during lifespan.
    os.environ["MONGODB_DB"] = "agrimitra_test"
    async with AsyncClient(
        transport=ASGITransport(app=app, client=("127.0.0.1", 123)), 
        base_url="http://test"
    ) as async_client:
        yield async_client

