from bson import ObjectId

from app.db.database import get_database
from app.repositories import user_repository


def get_me(user_id: str):
    return user_repository.get_user_by_id(user_id)


def update_me(user_id: str, updates: dict):
    user = user_repository.get_user_by_id(user_id)

    if not user:
        return None

    if "username" in updates:
        updates["username"] = updates["username"].strip()

        if len(updates["username"]) < 3:
            raise ValueError("Username must contain at least 3 characters")

    if "email" in updates:
        updates["email"] = str(updates["email"]).strip().lower()

        existing = user_repository.get_user_by_email(updates["email"])

        if existing and existing["_id"] != user["_id"]:
            raise ValueError("Email is already registered")

    if not updates:
        return user

    return user_repository.update_user(user_id, updates)


def get_settings(user_id: str):
    user = user_repository.get_user_by_id(user_id)

    if not user:
        return None

    return user.get("settings", {})


def update_settings(user_id: str, updates: dict):
    user = user_repository.get_user_by_id(user_id)

    if not user:
        return None

    if not updates:
        return user.get("settings", {})

    return user_repository.update_user_settings(user_id, updates)


def delete_me(user_id: str):
    user = user_repository.get_user_by_id(user_id)

    if not user:
        return False

    db = get_database()

    db.chat_messages.delete_many({"user_id": user_id})
    db.chat_sessions.delete_many({"user_id": user_id})

    return user_repository.delete_user(user_id)
