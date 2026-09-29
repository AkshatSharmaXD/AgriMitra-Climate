"""Shared route dependencies."""

from fastapi import HTTPException

from app.core.database import is_connected


async def require_database() -> None:
    """Guard routes that need MongoDB.

    Without this the ODM raises deep inside the handler and the caller gets a bare
    500 "Internal Server Error", which tells nobody anything. A 503 with a real
    sentence is both honest and actionable.
    """
    if not is_connected():
        raise HTTPException(
            503,
            "The farm database is unavailable, so stored records cannot be read or "
            "written. Weather, satellite, crop suitability and schemes still work.",
        )
