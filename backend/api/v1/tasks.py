from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from db.deps import get_db
from services.auth_service import get_current_user
from models.user import User

from schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskPriorityUpdate, TaskStatusUpdate, TaskListResponse
from models.task import TaskStatus, TaskPriority
from utils.permissions import get_my_project_role, require_min_role
from models.project_member import ProjectRole

from services.task_service import (
    list_project_tasks,
    get_project_task,
    create_project_task,
    update_project_task,
    delete_project_task,
    set_task_status,
    set_task_priority,
)

router = APIRouter(prefix="", tags=["Tasks"])


@router.get("/{project_id}/tasks", response_model=TaskListResponse)
async def api_list_tasks(
    project_id: int,
    status_: TaskStatus | None = Query(default=None, alias="status"),
    priority: TaskPriority | None = None,
    assigned_to: int | None = None,
    search: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    require_min_role(my_role, ProjectRole.VIEWER)

    tasks = await list_project_tasks(
        db,
        project_id,
        user.id,
        status=status_,
        priority=priority,
        assigned_to=assigned_to,
        search=search,
        limit=limit,
        offset=offset,
    )
    
    return {"role": my_role, "items": tasks}


@router.get("/{project_id}/tasks/{task_id}", response_model=TaskOut)
async def api_get_task(
    project_id: int,
    task_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    require_min_role(my_role, ProjectRole.VIEWER)

    task = await get_project_task(db, project_id, task_id, user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/{project_id}/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def api_create_task(
    project_id: int,
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
 
    my_role = await get_my_project_role(db, project_id, user.id)
    require_min_role(my_role, ProjectRole.MEMBER)

    task = await create_project_task(
        db,
        project_id,
        user.id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.due_date
    )

    if not task:
        raise HTTPException(status_code=404, detail="Project not found")
    return task


@router.patch("/{project_id}/tasks/{task_id}", response_model=TaskOut)
async def api_update_task(
    project_id: int,
    task_id: int,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    require_min_role(my_role, ProjectRole.MEMBER)

    task = await update_project_task(
        db,
        project_id,
        task_id,
        user.id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        status=payload.status,
        priority=payload.priority
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{project_id}/tasks/{task_id}/status", response_model=TaskOut)
async def api_set_task_status(
    project_id: int,
    task_id: int,
    payload: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    require_min_role(my_role, ProjectRole.MEMBER)

    task = await set_task_status(
        db,
        project_id,
        task_id,
        user.id,
        status=payload.status,
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.patch("/{project_id}/tasks/{task_id}/priority", response_model=TaskOut)
async def api_set_task_priority(
    project_id: int,
    task_id: int,
    payload: TaskPriorityUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    require_min_role(my_role, ProjectRole.MEMBER)

    task = await set_task_priority(
        db,
        project_id,
        task_id,
        user.id,
        priority=payload.priority,
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.delete("/{project_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def api_delete_task(
    project_id: int,
    task_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    # MVP policy: only ADMIN/OWNER can delete
    require_min_role(my_role, ProjectRole.ADMIN)

    ok = await delete_project_task(db, project_id, task_id, user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return None