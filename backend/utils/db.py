from db.session import engine
from db.base import Base
import db.model_import

async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def reset_db() -> None:
    """
    DEV ONLY:
    Drop all tables and recreate them.
    """
    async with engine.begin() as conn:
        # drop everything
        await conn.run_sync(Base.metadata.drop_all)

        # recreate schema
        await conn.run_sync(Base.metadata.create_all)