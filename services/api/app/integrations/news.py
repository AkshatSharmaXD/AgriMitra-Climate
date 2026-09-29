"""Agricultural news (PRD §13A public-data integrations).

Why this module is careful: the previous client shipped three hardcoded
headlines with invented attributions ("AgriNews Today", "Weather Dept") and
invented timestamps ("2 hours ago"), presented as a live feed. That is audit
finding A3 and PRD §16 forbids it outright.

So the feed is real or it is absent. Items come from a named publisher with a
real publication date and a working link, and when the source cannot be reached
the API says so instead of substituting anything.

The Press Information Bureau feed was evaluated first, being the official
government source, but its RSS cannot be filtered to the agriculture ministry —
it returns general national news, including sport — so it is not used.
"""

from __future__ import annotations

import html
import re
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import Any

import httpx
import structlog

from app.integrations import cache

logger = structlog.get_logger(__name__)

FEED_URL = "https://www.thehindubusinessline.com/economy/agri-business/feeder/default.rss"
PUBLISHER = "The Hindu BusinessLine"
TIMEOUT = httpx.Timeout(10.0, connect=4.0)
CACHE_KEY = "news:agri:v1"
TTL = 1800  # 30 minutes — a news feed does not need to be fresher than that
MAX_ITEMS = 12

_TAG = re.compile(r"<[^>]+>")


def _clean(value: str | None) -> str:
    """Strip markup and decode entities from a feed field."""
    if not value:
        return ""
    return html.unescape(_TAG.sub("", value)).strip()


def _parse(xml_text: str) -> list[dict[str, Any]]:
    # defusedxml guards against entity-expansion attacks in third-party XML.
    from defusedxml import ElementTree

    root = ElementTree.fromstring(xml_text)
    items: list[dict[str, Any]] = []

    for node in root.iter("item"):
        title = _clean(node.findtext("title"))
        link = _clean(node.findtext("link"))
        if not title or not link:
            continue

        published_raw = node.findtext("pubDate")
        published: str | None = None
        if published_raw:
            try:
                published = parsedate_to_datetime(_clean(published_raw)).isoformat()
            except (TypeError, ValueError):
                published = None

        items.append(
            {
                "title": title,
                "summary": _clean(node.findtext("description"))[:320] or None,
                "link": link,
                "published_at": published,
                "category": _clean(node.findtext("category")) or None,
                "publisher": PUBLISHER,
            }
        )
        if len(items) >= MAX_ITEMS:
            break

    return items


async def get_agriculture_news() -> dict[str, Any] | None:
    """Latest agriculture headlines, or None when the feed is unreachable."""
    if (hit := await cache.get(CACHE_KEY)) is not None:
        return hit

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
            response = await client.get(FEED_URL, headers={"User-Agent": "AgriMitra/2.0"})
            response.raise_for_status()
            items = _parse(response.text)
    except Exception as exc:
        logger.warning("news_fetch_failed", error=str(exc))
        return None

    if not items:
        return None

    payload = {
        "items": items,
        "publisher": PUBLISHER,
        "source_url": FEED_URL,
        "fetched_at": datetime.now().astimezone().isoformat(),
    }
    await cache.set(CACHE_KEY, payload, TTL)
    return payload
