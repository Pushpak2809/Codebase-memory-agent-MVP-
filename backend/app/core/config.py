from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = "development"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/cma"
    backend_url: str = "http://127.0.0.1:8000"
    frontend_url: str = "http://localhost:5173"
    secret_key: str = "replace-with-a-32-character-secret"

    hindsight_base_url: str = "https://your-instance.hindsight.vectorize.io"
    hindsight_api_key: str = ""
    hindsight_bank_id: str = "codebase-agent"

    github_token: str = ""
    github_webhook_secret: str = ""
    github_oauth_client_id: str = ""
    github_oauth_client_secret: str = ""

    groq_api_key: str = ""
    openai_api_key: str = ""

    max_upload_size_mb: int = 5
    max_diff_lines: int = 10000
    review_timeout_seconds: int = 30
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:5175",
            "http://127.0.0.1:5175",
        ]
    )

    @property
    def has_hindsight(self) -> bool:
        return bool(
            self.hindsight_api_key
            and self.hindsight_base_url
            and "your-instance" not in self.hindsight_base_url
        )

    @property
    def has_github_api(self) -> bool:
        return bool(self.github_token)

    @property
    def has_github_oauth(self) -> bool:
        return bool(self.github_oauth_client_id and self.github_oauth_client_secret)

    @property
    def has_groq(self) -> bool:
        return bool(self.groq_api_key)

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

