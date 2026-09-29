"""Farmer request schemas."""

from typing import Literal

from pydantic import BaseModel, Field


class FarmerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    # Indian mobile numbers, with or without the +91 country code.
    phone: str = Field(pattern=r"^(\+91)?[6-9]\d{9}$")
    language: Literal["en", "hi", "gu", "te"] = "en"
    is_demo: bool = False
