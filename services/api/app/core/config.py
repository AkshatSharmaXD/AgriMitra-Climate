"""Environment-driven configuration.

Every secret is read from the environment (or Google Secret Manager in Cloud Run).
Nothing here carries a usable default for a credential — a missing key degrades the
matching feature to a clearly-labelled fallback rather than silently inventing data.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Values shipped in .env.example as placeholders. Treated as "not configured".
PLACEHOLDERS = {
    "",
    "changeme",
    "your_gemini_api_key",
    "your_gemini_api_key_here",
    "your_data_gov_api_key",
    "your_google_maps_api_key",
    '{"type":"service_account"}',
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    log_level: str = "INFO"

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "agrimitra"

    # Explicit allowlist. Never "*" — PRD §18 requires CORS restriction.
    cors_origins: list[str] = Field(default=["http://localhost:3000"])

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"

    gee_service_account_json: str | None = None
    data_gov_api_key: str | None = None

    inference_service_url: str = "http://localhost:8001"

    # F9 / PRD §18 — upload validation.
    max_upload_bytes: int = 5 * 1024 * 1024
    allowed_image_types: set[str] = {"image/jpeg", "image/png", "image/webp"}

    rate_limit: str = "60/minute"
    ai_rate_limit: str = "10/minute"

    def configured(self, value: str | None) -> bool:
        return value is not None and value.strip() not in PLACEHOLDERS

    @property
    def gemini_enabled(self) -> bool:
        return self.configured(self.gemini_api_key)

    @property
    def earth_engine_enabled(self) -> bool:
        return self.configured(self.gee_service_account_json)

    @property
    def market_data_enabled(self) -> bool:
        return self.configured(self.data_gov_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
