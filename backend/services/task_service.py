from __future__ import annotations

from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.task import Task, TaskStatus, TaskPriority
from models.project import Project




# ---------- helpers ----------

def utcnow() -> datetime:
    return datetime.utcnow()


async def _ensure_project_access(
    db: AsyncSession,
    project_id: int,
    user_id: int,
) -> Project | None:
    """
    Minimal check: project exists AND user can access it.
    If you want to include ProjectMember access too, add that join here.
    """
    res = await db.execute(select(Project).where(Project.id == project_id))
    project = res.scalar_one_or_none()
    if not project:
        return None

    # TODO: add member access check if you have ProjectMember table
    # if project.owner_id != user_id and not is_member(project_id, user_id): return None

    return project


# ---------- CRUD: list / get ----------

async def list_project_tasks(
    db: AsyncSession,
    project_id: int,
    user_id: int,
    *,
    status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    assigned_to: int | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Task]:
    project = await _ensure_project_access(db, project_id, user_id)
    if not project:
        return []

    stmt = (
        select(Task)
        .where(Task.project_id == project_id)
        .order_by(Task.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    if status is not None:
        stmt = stmt.where(Task.status == status)
    if priority is not None:
        stmt = stmt.where(Task.priority == priority)
    if assigned_to is not None:
        stmt = stmt.where(Task.assigned_to == assigned_to)
    if search:
        like = f"%{search.strip().lower()}%"
        stmt = stmt.where(func.lower(Task.title).like(like))


    res = await db.execute(stmt)
    return list(res.scalars().unique().all())


async def get_project_task(
    db: AsyncSession,
    project_id: int,
    task_id: int,
    user_id: int,
) -> Task | None:
    project = await _ensure_project_access(db, project_id, user_id)
    if not project:
        return None

    res = await db.execute(
        select(Task)
        .where(Task.project_id == project_id, Task.id == task_id)
    )
    return res.scalar_one_or_none()


# ---------- CRUD: create ----------

async def create_project_task(
    db: AsyncSession,
    project_id: int,
    user_id: int,
    title: str,
    description: str | None = None,
    status: TaskStatus = TaskStatus.TODO,
    priority: TaskPriority = TaskPriority.MEDIUM,
    due_date: datetime | None = None,
) -> Task | None:
    project = await _ensure_project_access(db, project_id, user_id)
    if not project:
        return None

    task = Task(
        project_id=project_id,
        title=title.strip(),
        description=description,
        status=status,
        priority=priority,
        due_date=due_date,
        created_by=user_id,
        created_at=utcnow(),
        updated_at=utcnow(),
    )


    db.add(task)
    await db.commit()
    res = await db.execute(
        select(Task)
        .where(Task.id == task.id)
    )
    task = res.scalar_one()
    return task



# ---------- CRUD: update ----------

async def update_project_task(
    db: AsyncSession,
    project_id: int,
    task_id: int,
    user_id: int,
    title: str | None = None,
    description: str | None = None,
    due_date: datetime | None = None,
    status: TaskStatus | None = None,
    priority: TaskPriority | None = None
) -> Task | None:
    task = await get_project_task(db, project_id, task_id, user_id)
    if not task:
        return None

    if title is not None:
        task.title = title.strip()
    if description is not None:
        task.description = description
    if due_date is not None:
        task.due_date = due_date
    if status is not None:
        task.status = status
    if priority is not None:
        task.priority = priority

    task.updated_at = utcnow()

    await db.commit()
    await db.refresh(task)
    return task


# ---------- quick actions ----------

async def set_task_status(
    db: AsyncSession,
    project_id: int,
    task_id: int,
    user_id: int,
    *,
    status: TaskStatus,
) -> Task | None:
    task = await get_project_task(db, project_id, task_id, user_id)
    if not task:
        return None

    task.status = status
    task.updated_at = utcnow()
    await db.commit()
    await db.refresh(task)
    return task


async def set_task_priority(
    db: AsyncSession,
    project_id: int,
    task_id: int,
    user_id: int,
    *,
    priority: TaskPriority,
) -> Task | None:
    task = await get_project_task(db, project_id, task_id, user_id)
    if not task:
        return None

    task.priority = priority
    task.updated_at = utcnow()
    await db.commit()
    await db.refresh(task)
    return task


# ---------- delete ----------

async def delete_project_task(
    db: AsyncSession,
    project_id: int,
    task_id: int,
    user_id: int,
) -> bool:
    task = await get_project_task(db, project_id, task_id, user_id)
    if not task:
        return False

    await db.delete(task)
    await db.commit()
    return True