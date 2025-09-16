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

# --- Database Helper Functions ---

# Function to get a user from the database by their username
async def get_user(username: str) -> dict | None:
    user = await user_collection.find_one({"username": username})
    if user:
        return user
    return None