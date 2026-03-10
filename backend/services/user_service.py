from models.user import User
from models.project_member import ProjectMember, ProjectRole
from schemas.user import UserCreate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from utils.security import get_password_hash

async def get_user_by_email(
        db: AsyncSession, 
        email: str
)-> User | None:
    result = await db.execute(
        select(User).where(User.email == email)
    )   
    
    return result.scalar_one_or_none()


async def create_user_in_db(
        db: AsyncSession, 
        user: UserCreate
)-> User:
    result = await db.execute(
        select(User).where(User.email == user.email)
    )      
    
    userInDb = result.scalar_one_or_none()
    if userInDb:
        raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{userInDb.email}' already registred"
        )
    
    newUser = User(email=user.email, hashed_password=get_password_hash(user.password))
    db.add(newUser)
    await db.commit()
    await db.refresh(newUser)
    return newUser


async def get_user_role(
        db: AsyncSession, 
        project_id: int, 
        user_id: int
) -> ProjectRole | None:
    res = await db.execute(
        select(ProjectMember.role).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        )
    )
    return res.scalar_one_or_none()


async def search_users_by_email(
    db: AsyncSession,
    email: str | None = None,
    limit: int = 20,
) -> list[User]:
    stmt = select(User).order_by(User.email).limit(limit)

    if email:
        stmt = stmt.where(User.email.ilike(f"%{email}%"))

    res = await db.execute(stmt)
    return list(res.scalars().all())