from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.project import Project
from models.project_member import ProjectMember, ProjectRole
from models.user import User


async def get_my_project_role(
    db: AsyncSession,
    project_id: int,
    user_id: int,
) -> ProjectRole | None:
    res = await db.execute(select(Project).where(Project.id == project_id))
    project = res.scalar_one_or_none()
    if not project:
        return None

    if project.owner_id == user_id:
        return ProjectRole.OWNER

    res = await db.execute(
        select(ProjectMember.role).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )
    return res.scalar_one_or_none()


async def get_project_members(
    db: AsyncSession,
    project_id: int,
) -> list[dict]:
    project_res = await db.execute(select(Project).where(Project.id == project_id))
    project = project_res.scalar_one_or_none()
    if not project:
        return []

    members_res = await db.execute(
        select(ProjectMember, User.email)
        .join(User, User.id == ProjectMember.user_id)
        .where(ProjectMember.project_id == project_id)
    )
    rows = members_res.all()

    items = [
        {
            "user_id": row[0].user_id,
            "email": row[1],
            "role": row[0].role,
        }
        for row in rows
        if row[0].user_id != project.owner_id   # exclude owner if present
    ]

    owner_res = await db.execute(select(User.email).where(User.id == project.owner_id))
    owner_email = owner_res.scalar_one()

    items.insert(
        0,
        {
            "user_id": project.owner_id,
            "email": owner_email,
            "role": ProjectRole.OWNER,
        },
    )

    return items


async def add_project_member(
    db: AsyncSession,
    project_id: int,
    email: str,
    role: ProjectRole,
) -> dict | None:
    user_res = await db.execute(select(User).where(User.email == email))
    user = user_res.scalar_one_or_none()
    if not user:
        return None

    project_res = await db.execute(select(Project).where(Project.id == project_id))
    project = project_res.scalar_one_or_none()
    if not project:
        return None

    if user.id == project.owner_id:
        return {"already_owner": True}

    existing_res = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    )
    existing = existing_res.scalar_one_or_none()
    if existing:
        return {"already_exists": True}

    member = ProjectMember(
        project_id=project_id,
        user_id=user.id,
        role=role,
    )
    db.add(member)
    await db.commit()

    return {
        "user_id": user.id,
        "email": user.email,
        "role": role,
    }


async def update_project_member_role(
    db: AsyncSession,
    project_id: int,
    user_id: int,
    role: ProjectRole,
) -> dict | None:
    res = await db.execute(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
    )
    member = res.scalar_one_or_none()
    if not member:
        return None

    member.role = role
    await db.commit()

    user_res = await db.execute(select(User.email).where(User.id == user_id))
    email = user_res.scalar_one()

    return {
        "user_id": user_id,
        "email": email,
        "role": role,
    }


async def remove_project_member(
    db: AsyncSession,
    project_id: int,
    user_id: int,
) -> bool:
    res = await db.execute(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
    )
    member = res.scalar_one_or_none()
    if not member:
        return False

    await db.delete(member)
    await db.commit()
    return True