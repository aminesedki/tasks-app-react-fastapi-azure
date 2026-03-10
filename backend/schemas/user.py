from pydantic import BaseModel, EmailStr, Field
from datetime import datetime




class UserRead(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Plain password (will be hashed server-side)"
    )


class UserSearchOut(BaseModel):
    id: int
    email: EmailStr
    model_config = {"from_attributes": True}