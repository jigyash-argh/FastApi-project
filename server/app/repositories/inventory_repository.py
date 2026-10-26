from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from app.db.database import db

inventory_collection = db["inventory"]


def create_item(user_id: str, name: str, quantity: str, food_group: str) -> dict:
    now = datetime.now(timezone.utc)
    item_doc = {
        "user_id": user_id,
        "name": name.strip(),
        "quantity": quantity.strip(),
        "food_group": food_group.strip(),
        "created_at": now,
        "updated_at": now,
    }
    result = inventory_collection.insert_one(item_doc)
    item_doc["_id"] = result.inserted_id
    return item_doc


def get_user_inventory(user_id: str) -> list:
    cursor = inventory_collection.find({"user_id": user_id}).sort("created_at", -1)
    return list(cursor)


def delete_item(item_id: str, user_id: str) -> bool:
    if not ObjectId.is_valid(item_id):
        return False
    result = inventory_collection.delete_one({
        "_id": ObjectId(item_id),
        "user_id": user_id,
    })
    return result.deleted_count > 0