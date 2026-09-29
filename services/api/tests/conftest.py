"""Test fixtures.

Two clients, because the suite covers two different things:

``client``
    No database. The app is driven through an in-process ASGI transport with the
    lifespan disabled, so route validation, provenance labelling and the
    database-degradation paths can all be verified with nothing running. This is
    the default and it must never require MongoDB — most of what these tests
    assert has nothing to do with storage.

``db_client``
    A real MongoDB (Atlas or local), against a throwaway ``agrimitra_test``
    database. Skips with a clear reason when none is reachable, so a developer
    without a cluster still gets a green suite for everything else.
"""


import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.config import get_settings
from app.main import app

TEST_DB_NAME = "agrimitra_test"


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    """Database-free client. The lifespan is not run, so nothing connects."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as async_client:
        yield async_client


@pytest_asyncio.fixture(scope="session")
async def db():
    """A disposable test database, or a skip.

    Never points at the configured application database — the name is forced to
    ``agrimitra_test`` so a misread MONGODB_URI cannot drop real collections.
    """
    from beanie import init_beanie
    from motor.motor_asyncio import AsyncIOMotorClient

    from app.models.documents import DOCUMENT_MODELS

    settings = get_settings()
    motor_client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=3000)

    try:
        await motor_client.admin.command("ping")
    except Exception as exc:
        motor_client.close()
        pytest.skip(f"No MongoDB reachable at the configured URI ({type(exc).__name__})")

    database = motor_client[TEST_DB_NAME]

    async def drop_all() -> None:
        for name in await database.list_collection_names():
            await database.drop_collection(name)

    await drop_all()
    await init_beanie(database=database, document_models=DOCUMENT_MODELS)

    yield database

    await drop_all()
    motor_client.close()


@pytest_asyncio.fixture
async def db_client(db, monkeypatch) -> AsyncClient:
    """Client backed by the disposable test database, with the lifespan run."""
    monkeypatch.setenv("MONGODB_DB", TEST_DB_NAME)
    get_settings.cache_clear()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as async_client:
        yield async_client

    get_settings.cache_clear()
