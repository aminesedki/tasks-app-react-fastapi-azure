from __future__ import annotations
from sqlalchemy import String, Integer, DateTime, ForeignKey, func, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.user import User
    from models.project_member import ProjectMember


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    owner_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    owner: Mapped["User"] = relationship("User", back_populates="projects")
    members: Mapped[list["ProjectMember"]] = relationship(
        "ProjectMember",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("owner_id", "name", name="uq_project_owner_name"),
        Index("ix_projects_owner_name", "owner_id", "name"),
    )