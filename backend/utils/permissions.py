from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.project import Project
from models.project_member import ProjectMember, ProjectRole  # adjust import names to yours


# Map to a numeric level (easy comparisons)
ROLE_LEVEL = {
    ProjectRole.VIEWER: 10,
    ProjectRole.MEMBER: 20,
    ProjectRole.ADMIN: 30,
    ProjectRole.OWNER: 40,
}


"""
Policies:

VIEWER: read only

MEMBER: create/update/status/priority/tags but cannot delete

ADMIN/OWNER: delete
"""

async def get_my_project_role(db: AsyncSession, project_id: int, user_id: int) -> ProjectRole | None:
    # owner shortcut
    res = await db.execute(select(Project).where(Project.id == project_id))
    project = res.scalar_one_or_none()
    if not project:
        return None
    if project.owner_id == user_id:
        return ProjectRole.OWNER

    res = await db.execute(
        select(ProjectMember.role)
        .where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
    )
    role = res.scalar_one_or_none()
    return role


def require_min_role(my_role: ProjectRole | None, min_role: ProjectRole) -> None:
    if my_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if ROLE_LEVEL[my_role] < ROLE_LEVEL[min_role]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    

def can_manage_members(my_role: ProjectRole | None) -> bool:
    return my_role in {ProjectRole.OWNER, ProjectRole.ADMIN}


def can_delete_project(my_role: ProjectRole | None) -> bool:
    return my_role == ProjectRole.OWNER


def can_remove_member(
    actor_role: ProjectRole | None,
    target_role: ProjectRole,
) -> bool:
    if actor_role == ProjectRole.OWNER:
        return target_role != ProjectRole.OWNER

    if actor_role == ProjectRole.ADMIN:
        return target_role in {ProjectRole.MEMBER, ProjectRole.VIEWER}

    return False


def can_change_member_role(
    actor_role: ProjectRole | None,
    target_role: ProjectRole,
    new_role: ProjectRole,
) -> bool:
    if actor_role == ProjectRole.OWNER:
        return target_role != ProjectRole.OWNER and new_role != ProjectRole.OWNER

    if actor_role == ProjectRole.ADMIN:
        return (
            target_role in {ProjectRole.MEMBER, ProjectRole.VIEWER}
            and new_role in {ProjectRole.MEMBER, ProjectRole.VIEWER}
        )

    return False


def can_add_member_with_role(
    actor_role: ProjectRole | None,
    new_role: ProjectRole,
) -> bool:
    if actor_role == ProjectRole.OWNER:
        return new_role in {ProjectRole.ADMIN, ProjectRole.MEMBER, ProjectRole.VIEWER}

    if actor_role == ProjectRole.ADMIN:
        return new_role in {ProjectRole.MEMBER, ProjectRole.VIEWER}

    return False