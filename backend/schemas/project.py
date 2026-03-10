from pydantic import BaseModel, Field
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)


class ProjectRead(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime
    role: str
    model_config = {"from_attributes": True}

class ProjectOut(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}