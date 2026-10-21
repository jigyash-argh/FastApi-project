from datetime import datetime, timezone

from bson import ObjectId
from app.db.database import db


chat_sessions = db["chat_sessions"]
chat_messages = db["chat_messages"]


def create_chat(user_id: str, title: str):
    now = datetime.now(timezone.utc)

    result = chat_sessions.insert_one({
        "user_id": user_id,
        "title": title.strip(),
        "created_at": now,
        "updated_at": now,
    })

    return chat_sessions.find_one({"_id": result.inserted_id})


def get_user_chats(user_id: str):
    return list(
        chat_sessions.find({"user_id": user_id})
        .sort("updated_at", -1)
        .limit(100)
    )


def get_chat_by_id(chat_id: str, user_id: str):
    if not ObjectId.is_valid(chat_id):
        return None

    return chat_sessions.find_one({
        "_id": ObjectId(chat_id),
        "user_id": user_id,
    })


def save_message(
    chat_id: str,
    user_id: str,
    role: str,
    content: str,
):
    now = datetime.now(timezone.utc)

    result = chat_messages.insert_one({
        "session_id": chat_id,
        "user_id": user_id,
        "role": role,
        "content": content.strip(),
        "created_at": now,
    })

    chat_sessions.update_one(
        {
            "_id": ObjectId(chat_id),
            "user_id": user_id,
        },
        {"$set": {"updated_at": now}},
    )

    return chat_messages.find_one({"_id": result.inserted_id})


def get_chat_messages(chat_id: str, user_id: str):
    return list(
        chat_messages.find({
            "session_id": chat_id,
            "user_id": user_id,
        })
        .sort("created_at", 1)
        .limit(200)
    )


def rename_chat(chat_id: str, user_id: str, title: str):
    if not ObjectId.is_valid(chat_id):
        return None

    result = chat_sessions.update_one(
        {
            "_id": ObjectId(chat_id),
            "user_id": user_id,
        },
        {
            "$set": {
                "title": title.strip(),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    if result.matched_count == 0:
        return None

    return get_chat_by_id(chat_id, user_id)


def delete_chat(chat_id: str, user_id: str):
    if not ObjectId.is_valid(chat_id):
        return False

    result = chat_sessions.delete_one({
        "_id": ObjectId(chat_id),
        "user_id": user_id,
    })

    if result.deleted_count == 0:
        return False

    chat_messages.delete_many({
        "session_id": chat_id,
        "user_id": user_id,
    })

    return True