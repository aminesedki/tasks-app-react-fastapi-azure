from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from typing import List
from models.project import Project
from models.project_member import ProjectMember, ProjectRole
from schemas.project import ProjectUpdate, ProjectRead

from services.user_service import get_user_role

async def create_project(
    db: AsyncSession,
    name: str,
    owner_id: int
) -> Project:

    # Optional: prevent duplicate project name per owner
    existing = await db.execute(
        select(Project).where(
            Project.owner_id == owner_id,
            Project.name == name
        )
    )

    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Project with this name already exists"
        )

    project = Project(
        name=name,
        owner_id=owner_id
    )
    db.add(project)
    await db.flush()  # get project.id before commit

    # Add owner as member with OWNER role
    membership = ProjectMember(
        project_id=project.id,
        user_id=owner_id,
        role=ProjectRole.OWNER
    )

    db.add(membership)

    await db.commit()
    await db.refresh(project)

    return project
    
async def get_project(
        db: AsyncSession, 
        project_id: int
) -> Project:
    res = await db.execute(select(Project).where(Project.id == project_id))
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


async def get_user_projects(
    db: AsyncSession,
    user_id: int
) -> List[ProjectRead]:
    stmt = (
        select(Project, ProjectMember.role)
        .outerjoin(
            ProjectMember,
            (Project.id == ProjectMember.project_id)
            & (ProjectMember.user_id == user_id)
        )
        .where(
            or_(
                Project.owner_id == user_id,
                ProjectMember.user_id.is_not(None)
            )
        )
    )

    result = await db.execute(stmt)
    rows = result.all()

    projects = []
    for project, role in rows:
        my_role = ProjectRole.OWNER if project.owner_id == user_id else role

        projects.append({
            "id": project.id,
            "name": project.name,
            "owner_id": project.owner_id,
            "created_at": project.created_at,
            "role": my_role,
        })

    return projects


async def update_project(
    db: AsyncSession,
    project_id: int,
    user_id: int,
    patch: ProjectUpdate
) -> Project:
    role = await get_user_role(db, project_id, user_id)
    if role not in {ProjectRole.OWNER, ProjectRole.ADMIN}:
        raise HTTPException(status_code=403, detail="Not allowed to edit this project")

    project = await get_project(db, project_id)

    if patch.name is not None:
        # optional: unique per owner
        exists = await db.execute(
            select(Project).where(Project.owner_id == project.owner_id, Project.name == patch.name)
        )
        if exists.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Project name already exists")
        project.name = patch.name

    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(
    db: AsyncSession,
    project_id: int,
    user_id: int
) -> None:
    role = await get_user_role(db, project_id, user_id)
    if role != ProjectRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owner can delete this project")

    project = await get_project(db, project_id)

    await db.delete(project)
    await db.commit()