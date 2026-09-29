"""Voice request schemas."""

from typing import Literal

from pydantic import BaseModel, Field


class SynthesizeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=3000)
    language: Literal["en", "hi", "gu", "te"] = "en"
