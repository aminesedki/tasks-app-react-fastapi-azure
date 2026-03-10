from pydantic import BaseModel, Field
from models.task import TaskStatus, TaskPriority
from datetime import date, datetime
from pydantic import BaseModel, Field
from models.project_member import ProjectRole


class TaskBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    due_date: date | None = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = None
    due_date: date | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None


class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    due_date: date | None
    created_by: int
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class TaskListResponse(BaseModel):
    role: ProjectRole
    items: list[TaskOut]

class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskPriorityUpdate(BaseModel):
    priority: TaskPriority