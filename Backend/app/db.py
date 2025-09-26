# app/db.py
import motor.motor_asyncio
from .config import settings  # <-- IMPORT from our new config file

# This is the main connection to your MongoDB database
# It now uses the DATABASE_URL from the central settings object
client = motor.motor_asyncio.AsyncIOMotorClient(settings.DATABASE_URL)

# We get a specific database from our MongoDB cluster
database = client.FoodToFeastDB

# We get a specific "collection" where we'll store users
user_collection = database.get_collection("users")
history_collection = database.get_collection("history")

# Function to get a user from the database by their username
async def get_user(username: str) -> dict | None:
    user = await user_collection.find_one({"username": username})
    if user:
        return user
    return None

async def get_chat_history(username: str) -> list:
    history = await history_collection.find_one({"username": username})
    if history:
        return history["history"]
    return []

async def create_chat_history(username: str, title: str) -> dict:
    history_item = {"title": title, "messages": []}
    await history_collection.update_one(
        {"username": username},
        {"$push": {"history": history_item}},
        upsert=True
    )
    return history_item

async def get_chat_by_title(username: str, title: str) -> dict | None:
    user_history = await history_collection.find_one({"username": username})
    if user_history:
        for chat in user_history.get("history", []):
            if chat.get("title") == title:
                return chat
    return None

async def add_message_to_chat(username: str, title: str, message: dict):
    await history_collection.update_one(
        {"username": username, "history.title": title},
        {"$push": {"history.$.messages": message}}
    )

async def delete_chat_history(username: str, titles: list[str]):
    return await history_collection.update_one(
        {"username": username},
        {"$pull": {"history": {"title": {"$in": titles}}}}
    )
