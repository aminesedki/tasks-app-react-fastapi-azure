from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_PATH = BASE_DIR / "app.db"


class Settings(BaseSettings):
    app_env: str = "dev"

    db_host: str | None = None
    db_port: int = 5432
    db_name: str | None = None
    db_user: str | None = None
    db_password: str | None = None

    sqlite_path: Path = DEFAULT_SQLITE_PATH

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def use_postgres(self) -> bool:
        return all(
            [
                self.db_host,
                self.db_name,
                self.db_user,
                self.db_password,
            ]
        )

    @property
    def database_url(self) -> str | URL:

        if self.use_postgres:
            return URL.create(
                drivername="postgresql+asyncpg",
                username=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port,
                database=self.db_name,
                query={"ssl": "require"}
            )

        return f"sqlite+aiosqlite:///{self.sqlite_path}"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
DATABASE_URL = settings.database_url
print(DATABASE_URL)