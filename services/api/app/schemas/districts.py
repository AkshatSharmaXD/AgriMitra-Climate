"""District request schemas."""

from typing import Literal

from pydantic import BaseModel


class InterventionRequest(BaseModel):
    language: Literal["en", "hi", "gu", "te"] = "en"
