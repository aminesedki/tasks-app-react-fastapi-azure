from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from db.deps import get_db
from services.user_service import create_user_in_db, search_users_by_email
from services.auth_service import get_current_user
from schemas.user import UserCreate, UserRead, UserSearchOut

router = APIRouter(prefix='', tags=['users'])

@router.post('', response_model=UserRead)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    createdUser = await create_user_in_db(db, user)
    return createdUser

@router.get("/me")
async def me(
    current_user:  User = Depends(get_current_user)
):
    return {"id": current_user.id, "email": current_user.email}


@router.get("/search", response_model=list[UserSearchOut])
async def api_search_users(
    email: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await search_users_by_email(db, email=email, limit=limit)