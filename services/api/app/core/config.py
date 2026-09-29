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

    # Local default. In Atlas this is a `mongodb+srv://` URI containing a password,
    # so it belongs in Secret Manager and never in the image or the repo.
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "agrimitra"

    # Atlas sits across the public internet and an idle shared-tier cluster can be
    # slow to first respond, so server selection needs more headroom than a
    # loopback mongod. Shared tiers also cap connections, hence the modest pool.
    mongodb_timeout_ms: int = 10_000
    mongodb_max_pool_size: int = 20

    # Explicit allowlist. Never "*" — PRD §18 requires CORS restriction.
    cors_origins: list[str] = Field(default=["http://localhost:3000"])

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"

    # --- Vertex AI -----------------------------------------------------------
    # Same Gemini models, reached through Vertex with the service account's own
    # IAM identity instead of a shared API key. On Cloud Run that means no key to
    # store, rotate or leak. Set use_vertex_ai=true and the project/location.
    use_vertex_ai: bool = False
    gcp_project: str | None = None
    gcp_location: str = "asia-south1"

    # --- Google Cloud services ----------------------------------------------
    # Leaf-scan images. Absent -> the diagnosis is still stored, without a photo.
    gcs_bucket: str | None = None
    # Server-side Geocoding key. Turns the farmer's GPS fix into a district and
    # state so they do not have to type them. Restrict this key to the Geocoding
    # API by IP — it is not the browser Maps key.
    google_maps_api_key: str | None = None
    # Server-side speech, for browsers with no Web Speech API.
    enable_cloud_speech: bool = False
    # Static reference text (the scheme directory) in the farmer's language.
    enable_translation: bool = False
    # District analytics warehouse. Absent -> aggregation runs against MongoDB.
    bigquery_dataset: str | None = None
    # Async NDVI refresh fan-out.
    pubsub_topic_ndvi_refresh: str | None = None

    # Cache. Absent -> every lookup goes to the upstream API.
    redis_url: str | None = None

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
    def mongodb_is_remote(self) -> bool:
        """True for anything that is not a loopback mongod.

        Used to refuse destructive operations against a hosted cluster unless the
        operator confirms.
        """
        return not any(
            host in self.mongodb_uri for host in ("localhost", "127.0.0.1", "[::1]")
        )

    @property
    def gemini_enabled(self) -> bool:
        """Either auth path counts: an API key, or Vertex with a project."""
        if self.use_vertex_ai:
            return self.configured(self.gcp_project)
        return self.configured(self.gemini_api_key)

    @property
    def cloud_storage_enabled(self) -> bool:
        return self.configured(self.gcs_bucket)

    @property
    def geocoding_enabled(self) -> bool:
        return self.configured(self.google_maps_api_key)

    @property
    def cloud_speech_enabled(self) -> bool:
        return self.enable_cloud_speech and self.configured(self.gcp_project)

    @property
    def translation_enabled(self) -> bool:
        return self.enable_translation and self.configured(self.gcp_project)

    @property
    def bigquery_enabled(self) -> bool:
        return self.configured(self.bigquery_dataset) and self.configured(self.gcp_project)

    @property
    def pubsub_enabled(self) -> bool:
        return self.configured(self.pubsub_topic_ndvi_refresh) and self.configured(
            self.gcp_project
        )

    @property
    def cache_enabled(self) -> bool:
        return self.configured(self.redis_url)

    @property
    def earth_engine_enabled(self) -> bool:
        return self.configured(self.gee_service_account_json)

    @property
    def market_data_enabled(self) -> bool:
        return self.configured(self.data_gov_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
