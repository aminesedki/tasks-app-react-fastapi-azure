from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.deps import get_db
from services.auth_service import get_current_user
from utils.permissions import (
    can_add_member_with_role,
    can_change_member_role,
    can_manage_members,
    can_remove_member,
    require_min_role,
)
from models.user import User
from models.project_member import ProjectRole
from schemas.membership import (
    ProjectMemberOut,
    ProjectMemberCreate,
    ProjectMemberRoleUpdate,
)
from services.membership_servcie import (
    get_my_project_role,
    get_project_members,
    add_project_member,
    update_project_member_role,
    remove_project_member,
)

router = APIRouter(prefix="", tags=["Project Members"])


@router.get("/{project_id}/members", response_model=list[ProjectMemberOut])
async def api_get_project_members(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    require_min_role(my_role, ProjectRole.VIEWER)

    return await get_project_members(db, project_id)


@router.post("/{project_id}/members", response_model=ProjectMemberOut, status_code=status.HTTP_201_CREATED)
async def api_add_project_member(
    project_id: int,
    payload: ProjectMemberCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)

    if not can_manage_members(my_role) or not can_add_member_with_role(my_role, payload.role):
        raise HTTPException(status_code=403, detail="Not allowed to add member with this role")

    result = await add_project_member(db, project_id, payload.email, payload.role)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    if result.get("already_exists"):
        raise HTTPException(status_code=409, detail="User is already a member")

    return result


@router.patch("/{project_id}/members/{member_user_id}", response_model=ProjectMemberOut)
async def api_update_project_member_role(
    project_id: int,
    member_user_id: int,
    payload: ProjectMemberRoleUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    members = await get_project_members(db, project_id)

    target = next((m for m in members if m["user_id"] == member_user_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")

    target_role = target["role"]

    if not can_change_member_role(my_role, target_role, payload.role):
        raise HTTPException(status_code=403, detail="Not allowed to change this member role")

    result = await update_project_member_role(db, project_id, member_user_id, payload.role)
    if not result:
        raise HTTPException(status_code=404, detail="Member not found")

    return result


@router.delete("/{project_id}/members/{member_user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def api_remove_project_member(
    project_id: int,
    member_user_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    my_role = await get_my_project_role(db, project_id, user.id)
    members = await get_project_members(db, project_id)

    target = next((m for m in members if m["user_id"] == member_user_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")

    if not can_remove_member(my_role, target["role"]):
        raise HTTPException(status_code=403, detail="Not allowed to remove this member")

    ok = await remove_project_member(db, project_id, member_user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Member not found")

    return None