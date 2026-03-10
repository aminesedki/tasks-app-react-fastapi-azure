from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.deps import get_db
from services.auth_service import get_current_user  # your JWT dependency
from schemas.project import ProjectCreate, ProjectUpdate, ProjectRead, ProjectOut

from services.project_service import (
    create_project,
    update_project,
    delete_project,
    get_user_projects,
    get_project,
)

router = APIRouter(prefix="", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # owner OR member (depending on your service implementation)
    return await get_user_projects(db, current_user.id)


@router.get("/{project_id}", response_model=ProjectRead)
async def read_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # If you want to enforce access control here, do it in the service:
    # e.g. ensure current_user is owner/member, otherwise 403.
    return await get_project(db, project_id)


@router.post(
    '',
    response_model=ProjectOut,
    status_code=status.HTTP_201_CREATED
)
async def create_project_endpoint(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await create_project(db, project_in.name, current_user.id)


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project_endpoint(
    project_id: int,
    patch: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await update_project(db, project_id, current_user.id, patch)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_endpoint(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    await delete_project(db, project_id, current_user.id)
    return None