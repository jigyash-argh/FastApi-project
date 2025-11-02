import motor.motor_asyncio 
from .config import settings
from datetime import datetime, timedelta
from bson import ObjectId
import json

# Custom JSON encoder to handle ObjectId and datetime
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

# Function to convert MongoDB documents to JSON-serializable format
def serialize_doc(doc):
    if not doc:
        return None
    if '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

def serialize_docs(docs):
    return [serialize_doc(doc) for doc in docs]

# This is the main connection to your MongoDB database
client = motor.motor_asyncio.AsyncIOMotorClient(settings.DATABASE_URL)
database = client.FoodToFeastDB

# We get specific collections
user_collection = database.get_collection("users")
history_collection = database.get_collection("history")
dashboard_collection = database.get_collection("dashboard")

# Function to get a user from the database by their username
async def get_user(username: str) -> dict | None:
    user = await user_collection.find_one({"username": username})
    return serialize_doc(user)

async def get_chat_history(username: str) -> list:
    history = await history_collection.find_one({"username": username})
    if history:
        return serialize_doc(history).get("history", [])
    return []

async def create_chat_history(username: str, title: str) -> dict:
    history_item = {"title": title, "messages": []}
    
    result = await history_collection.update_one(
        {"username": username, "history.title": {"$ne": title}},
        {"$push": {"history": history_item}},
        upsert=True
    )
    
    if result.modified_count == 0:
        user_doc = await history_collection.find_one({"username": username})
        if user_doc:
            for item in user_doc.get("history", []):
                if item.get("title") == title:
                    return serialize_doc(item)
        raise ValueError(f"Chat with title '{title}' already exists")
    
    return history_item

async def get_chat_by_title(username: str, title: str) -> dict | None:
    user_history = await history_collection.find_one({"username": username})
    if user_history:
        for chat in user_history.get("history", []):
            if chat.get("title") == title:
                return serialize_doc(chat)
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

# Favorites
async def add_to_favorite(username: str, recipe_name: str):
    return await user_collection.update_one(
        {"username": username},
        {"$addToSet": {"favorites": recipe_name}}
    )

async def remove_from_favorites(username: str, recipe_name: str):
    return await user_collection.update_one(
        {"username": username},
        {"$pull": {"favorites": recipe_name}}
    )

async def get_favorites(username: str):
    user = await user_collection.find_one({"username": username})
    return user.get("favorites", []) if user else []

# Cooked recipes in user collection (simple array)
async def add_to_cooked(username: str, recipe_name: str):
    return await user_collection.update_one(
        {"username": username},
        {"$addToSet": {"cooked": recipe_name}}
    )

async def remove_from_cooked(username: str, recipe_name: str):
    return await user_collection.update_one(
        {"username": username},
        {"$pull": {"cooked": recipe_name}}
    )

async def get_cooked(username: str):
    user = await user_collection.find_one({"username": username})
    return user.get("cooked", []) if user else []

# Dashboard - For detailed tracking with calories
async def add_cooked_recipe_dashboard(username: str, recipe_data: dict):
    cooked_item = {
        "username": username,
        "recipe_name": recipe_data["recipe_name"],
        "calories": recipe_data["calories"],
        "cooked_at": recipe_data.get("cooked_at", datetime.utcnow().isoformat()),
        "servings": recipe_data.get("servings", 1),
        "recipe_data": recipe_data.get("recipe_data", {}),
        "created_at": datetime.utcnow()
    }
    
    result = await dashboard_collection.insert_one(cooked_item)
    cooked_item['id'] = str(result.inserted_id)
    return cooked_item

async def get_today_cooked_recipes(username: str):
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    cooked_recipes = await dashboard_collection.find({
        "username": username,
        "cooked_at": {"$gte": today_start.isoformat()}
    }).sort("cooked_at", -1).to_list(length=None)
    
    return serialize_docs(cooked_recipes)

async def get_user_dashboard_stats(username: str):
    # Get today's cooked recipes
    today_recipes = await get_today_cooked_recipes(username)
    today_calories = sum(recipe["calories"] for recipe in today_recipes)
    
    # Get total recipes cooked (all time)
    total_recipes = await dashboard_collection.count_documents({"username": username})
    
    # Calculate cooking streak
    streak = await calculate_cooking_streak(username)
    
    return {
        "today_calories": today_calories,
        "today_recipes": today_recipes,
        "total_recipes": total_recipes,
        "streak": streak
    }

async def calculate_cooking_streak(username: str):
    # Get all cooked recipes sorted by date
    all_recipes = await dashboard_collection.find(
        {"username": username}
    ).sort("cooked_at", -1).to_list(length=None)
    
    if not all_recipes:
        return 0
    
    # Get unique dates when user cooked
    dates_cooked = set()
    for recipe in all_recipes:
        try:
            cooked_date = datetime.fromisoformat(recipe["cooked_at"]).date()
            dates_cooked.add(cooked_date)
        except (ValueError, KeyError):
            continue
    
    # Sort dates in descending order
    sorted_dates = sorted(dates_cooked, reverse=True)
    
    # Calculate streak
    streak = 0
    current_date = datetime.now().date()
    
    for i, cooked_date in enumerate(sorted_dates):
        days_diff = (current_date - cooked_date).days
        
        # If this is consecutive day, increase streak
        if days_diff == i:
            streak += 1
        else:
            break
    
    return streak

async def get_weekly_calories(username: str):
    today = datetime.now().date()
    week_data = []
    
    for i in range(7):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        
        # Get recipes cooked on this day
        day_recipes = await dashboard_collection.find({
            "username": username,
            "cooked_at": {
                "$gte": day_start.isoformat(),
                "$lte": day_end.isoformat()
            }
        }).to_list(length=None)
        
        day_calories = sum(recipe["calories"] for recipe in day_recipes)
        
        week_data.append({
            "date": day.isoformat(),
            "day_name": day.strftime("%a"),
            "calories": day_calories,
            "recipes_count": len(day_recipes)
        })
    
    return week_data[::-1]

async def get_user_health_metrics(username: str):
    user = await user_collection.find_one({"username": username})
    if not user:
        return None
    
    return serialize_doc({
        "age": user.get("age", 25),
        "goal_calories": user.get("goal_calories", 2200),
        "weight": user.get("weight"),
        "height": user.get("height"),
        "dietary_preferences": user.get("dietary_preferences", []),
        "allergies": user.get("allergies", [])
    })

async def update_user_health_metrics(username: str, metrics: dict):
    update_data = {}
    
    if "age" in metrics:
        update_data["age"] = metrics["age"]
    if "goal_calories" in metrics:
        update_data["goal_calories"] = metrics["goal_calories"]
    if "weight" in metrics:
        update_data["weight"] = metrics["weight"]
    if "height" in metrics:
        update_data["height"] = metrics["height"]
    if "dietary_preferences" in metrics:
        update_data["dietary_preferences"] = metrics["dietary_preferences"]
    if "allergies" in metrics:
        update_data["allergies"] = metrics["allergies"]
    
    if update_data:
        return await user_collection.update_one(
            {"username": username},
            {"$set": update_data}
        )
    
    return None

async def get_cooking_insights(username: str):
    # Most cooked recipes
    pipeline = [
        {"$match": {"username": username}},
        {"$group": {
            "_id": "$recipe_name",
            "count": {"$sum": 1},
            "total_calories": {"$sum": "$calories"},
            "last_cooked": {"$max": "$cooked_at"}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    
    most_cooked = await dashboard_collection.aggregate(pipeline).to_list(length=5)
    most_cooked = serialize_docs(most_cooked)
    
    # Average calories per meal
    avg_calories_pipeline = [
        {"$match": {"username": username}},
        {"$group": {
            "_id": None,
            "avg_calories": {"$avg": "$calories"},
            "total_meals": {"$sum": 1}
        }}
    ]
    
    avg_result = await dashboard_collection.aggregate(avg_calories_pipeline).to_list(length=1)
    avg_calories = avg_result[0]["avg_calories"] if avg_result else 0
    
    return {
        "most_cooked_recipes": most_cooked,
        "average_calories_per_meal": round(avg_calories, 1),
        "total_meals_cooked": avg_result[0]["total_meals"] if avg_result else 0
    }

async def delete_cooked_recipe(username: str, recipe_name: str, cooked_at: str):
    return await dashboard_collection.delete_one({
        "username": username,
        "recipe_name": recipe_name,
        "cooked_at": cooked_at
    })

async def get_recent_cooked_recipes(username: str, limit: int = 10):
    cooked_recipes = await dashboard_collection.find({
        "username": username
    }).sort("cooked_at", -1).limit(limit).to_list(length=limit)
    
    return serialize_docs(cooked_recipes)