from pydantic import BaseModel, EmailStr
from datetime import datetime
from models.project_member import ProjectRole


class ProjectMemberOut(BaseModel):
    user_id: int
    email: EmailStr
    role: ProjectRole

    model_config = {"from_attributes": True}


class ProjectMemberCreate(BaseModel):
    email: EmailStr
    role: ProjectRole

class ProjectMemberRoleUpdate(BaseModel):
    role: ProjectRole


class ProjectMemberRead(BaseModel):
    project_id: int
    user_id: int
    role: ProjectRole
    joined_at: datetime

    model_config = {"from_attributes": True}