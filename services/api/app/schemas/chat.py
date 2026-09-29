"""Chat request schemas."""

from typing import Literal

from pydantic import BaseModel, Field


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    farm_id: str = Field(min_length=1, max_length=64)
    message: str = Field(min_length=1, max_length=1000)
    language: Literal["en", "hi", "gu", "te"] = "en"
    history: list[ChatTurn] = Field(default_factory=list, max_length=20)
