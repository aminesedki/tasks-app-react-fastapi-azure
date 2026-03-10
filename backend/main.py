from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn, logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


from utils.db import init_db #, reset_db
from api.base import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Starting application lifespan")
        await init_db()
        logger.info("Database initialization succeeded")
    except Exception as e:
        logger.exception("Database initialization failed")
        raise
    yield


app = FastAPI(lifespan=lifespan) 


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def index():
    return {"message": "Project Tasks API"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080)