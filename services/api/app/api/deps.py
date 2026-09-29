"""Shared route dependencies."""

from fastapi import HTTPException

from app.core.database import is_connected, schedule_reconnect


async def require_database() -> None:
    """Guard routes that need MongoDB.

    Without this the ODM raises deep inside the handler and the caller gets a bare
    500 "Internal Server Error", which tells nobody anything. A 503 with a real
    sentence is both honest and actionable.

    A failed check also schedules a background reconnect, so the API recovers from
    a transient Atlas outage on its own. This request still fails fast rather than
    waiting on it.
    """
    if not is_connected():
        schedule_reconnect()
        raise HTTPException(
            503,
            "The farm database is unavailable, so stored records cannot be read or "
            "written. Weather, satellite, crop suitability and schemes still work.",
        )
