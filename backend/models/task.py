from __future__ import annotations
from db.base import Base

from sqlalchemy import Integer, String, DateTime, ForeignKey, Index, func, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, date
from enum import Enum


class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    ARCHIVED = "ARCHIVED"

class TaskPriority(int, Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4

class Task(Base):
    __tablename__ = "tasks"
   
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), index=True)
    created_by: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    description:Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[TaskStatus] = mapped_column(
                                                String,  
                                                nullable=False, 
                                                default=TaskStatus.TODO
    )
    priority: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
        default=TaskPriority.MEDIUM
    )
    
    due_date: Mapped[date] = mapped_column(Date, nullable=True)   
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )  

    __table_args__ = (
        Index("ix_task_project_status", "project_id", "status"),
        Index("ix_task_due_date", "due_date"),
    )