from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from core.config import settings, DATABASE_URL


engine_kwargs = {
    "echo": False,
    "future": True
}

if not settings.use_postgres:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(
    DATABASE_URL,
    **engine_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)
