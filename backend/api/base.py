from fastapi import APIRouter
from api.v1.users import router as user_router
from api.v1.auth import router as auth_router
from api.v1.projects import router as projects_router
from api.v1.tasks import router as tasks_router
from api.v1.project_members import router as members_router
api_router = APIRouter(prefix="/api/v1")


api_router.include_router(router=auth_router, prefix='/auth')
api_router.include_router(router=user_router, prefix='/users')
api_router.include_router(router=projects_router, prefix='/projects')
api_router.include_router(router=members_router, prefix='/projects')
api_router.include_router(router=tasks_router, prefix='/projects')