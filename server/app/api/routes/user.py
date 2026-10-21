from fastapi import APIRouter, Depends, HTTPException, status

from app.api.routes.dependencies import get_current_user
from app.schemas.user import UserUpdate, UserSettingsUpdate
from app.services import user_services as service

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_id(current_user) -> str:
    return str(current_user["_id"])


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "settings": user.get("settings", {}),
    }


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    user = service.get_me(get_user_id(current_user))

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return serialize_user(user)


@router.patch("/me")
def update_me(
    payload: UserUpdate,
    current_user=Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)

    if any(value is None for value in updates.values()):
        raise HTTPException(
            status_code=422,
            detail="Profile fields cannot be null",
        )

    try:
        user = service.update_me(
            get_user_id(current_user),
            updates,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return serialize_user(user)


@router.get("/me/settings")
def get_settings(current_user=Depends(get_current_user)):
    settings = service.get_settings(get_user_id(current_user))

    if settings is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return settings


@router.patch("/me/settings")
def update_settings(
    payload: UserSettingsUpdate,
    current_user=Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)

    if any(value is None for value in updates.values()):
        raise HTTPException(
            status_code=422,
            detail="Settings fields cannot be null",
        )

    settings = service.update_settings(
        get_user_id(current_user),
        updates,
    )

    if settings is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return settings


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_me(current_user=Depends(get_current_user)):
    deleted = service.delete_me(get_user_id(current_user))

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
