from __future__ import annotations
from sqlalchemy import Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum as SQLEnum, Index, func
from datetime import datetime
from enum import Enum
from db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.user import User
    from models.project import Project

class ProjectRole(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"


class ProjectMember(Base):
    __tablename__ = "project_members"

    project_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    role: Mapped[ProjectRole] = mapped_column(
        SQLEnum(ProjectRole, name="project_role_enum", native_enum=False),  # works well with SQLite too
        nullable=False,
        default=ProjectRole.MEMBER
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # optional relationships
    project: Mapped["Project"] = relationship("Project", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="project_memberships")

    __table_args__ = (
        Index("ix_project_members_project", "project_id"),
        Index("ix_project_members_user", "user_id"),
    )