from bson import ObjectId
from app.db.database import get_database


def get_user_by_email(email: str):
    db = get_database()
    return db.users.find_one({"email": email})


def create_user(user_data: dict):
    db = get_database()
    result = db.users.insert_one(user_data)
    return str(result.inserted_id)


def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        return None

    db = get_database()
    return db.users.find_one({"_id": ObjectId(user_id)})


def update_user(user_id: str, updates: dict):
    if not ObjectId.is_valid(user_id):
        return None

    db = get_database()

    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": updates},
    )

    if result.matched_count == 0:
        return None

    return get_user_by_id(user_id)


def update_user_settings(user_id: str, updates: dict):
    if not ObjectId.is_valid(user_id):
        return None

    db = get_database()

    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                f"settings.{key}": value
                for key, value in updates.items()
            }
        },
    )

    if result.matched_count == 0:
        return None

    user = get_user_by_id(user_id)
    return user.get("settings", {}) if user else None


def delete_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        return False

    db = get_database()

    result = db.users.delete_one({
        "_id": ObjectId(user_id)
    })

    return result.deleted_count == 1
