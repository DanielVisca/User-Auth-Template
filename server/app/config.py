"""Application configuration from environment."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Server settings. All secrets from env."""

    # App
    app_name: str = "Auth API"
    debug: bool = False

    # Database (SQLite for template; use DATABASE_URL for PostgreSQL in production)
    database_url: str = "sqlite+aiosqlite:///./auth.db"

    # Auth
    secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # Cookies (for JWT in httpOnly cookie)
    cookie_name: str = "session"
    cookie_secure: bool = False  # True in production with HTTPS
    cookie_same_site: str = "lax"  # strict or lax
    cookie_domain: str | None = None

    # CORS (frontend origin)
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Password reset / email verification token TTL (minutes)
    reset_token_expire_minutes: int = 60
    verify_token_expire_minutes: int = 60 * 24  # 24h

    # Email (stub: log to console if not configured)
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    mail_from: str = "noreply@example.com"
    frontend_url: str = "http://localhost:5173"  # For reset/verify links

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
