"""Test fixtures.

The app is exercised through an in-process ASGI transport with the lifespan
disabled, so route behaviour can be verified without a MongoDB instance. Routes
that touch the database are covered separately against a live database.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as async_client:
        yield async_client
