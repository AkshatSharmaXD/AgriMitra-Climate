"""Agricultural news headlines."""

from fastapi import APIRouter, HTTPException

from app.integrations.news import get_agriculture_news

router = APIRouter()


@router.get("")
async def read_news() -> dict:
    result = await get_agriculture_news()
    if result is None:
        # No feed means no headlines. The previous client filled this space with
        # invented stories and invented sources (audit A3).
        raise HTTPException(
            503, "The news feed could not be reached. No headlines are shown."
        )
    return result
