
from fastapi import APIRouter, status

from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse
)

from app.services.auth_services import (
    register_user,
    login_user
)

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
async def register(data: UserRegister):
    return await register_user(
        username=data.username,
        email=str(data.email),
        password=data.password
    )


@router.post(
    "/login",
    response_model=TokenResponse
)
async def login(data: UserLogin):
    return await login_user(
        email=str(data.email),
        password=data.password
    )
