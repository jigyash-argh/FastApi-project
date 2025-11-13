# app/db.py
import motor.motor_asyncio 
from .config import settings  # Assuming you have a config.py for settings
from datetime import datetime, timedelta, timezone
from bson import ObjectId

# --- Database Setup ---
client = motor.motor_asyncio.AsyncIOMotorClient(settings.DATABASE_URL)
database = client.FoodToFeastDB
user_collection = database.get_collection("users")
history_collection = database.get_collection("history")
dashboard_collection = database.get_collection("dashboard")

# --- Serializers ---
def serialize_doc(doc): 
    """Converts a MongoDB doc to a JSON-serializable dict."""
    if not doc:
        return None
    if '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    
    # Convert datetimes to ISO strings
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

def serialize_docs(docs):
    return [serialize_doc(doc) for doc in docs]

# --- User Collection ---
async def get_user(username: str) -> dict | None:
    user = await user_collection.find_one({"username": username})
    return serialize_doc(user)

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
    # Only update fields that are present in the metrics dict
    update_data = {key: value for key, value in metrics.items() if value is not None}
    if update_data:
        return await user_collection.update_one(
            {"username": username},
            {"$set": update_data}
        )
    return None

# --- Favorites (in User Collection) ---
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

# --- History Collection ---
# app/db.py

async def get_chat_history(username: str) -> list:
    history_doc = await history_collection.find_one({"username": username})
    
    if not history_doc or "history" not in history_doc:
        return []

    # --- THIS IS THE CRITICAL FIX ---
    transformed_history = []
    for chat_item in history_doc.get("history", []):
        transformed_messages = []
        for message in chat_item.get("messages", []):
            # Rename 'sender' to 'role' and 'text' to 'content'
            transformed_messages.append({
                "role": message.get("sender",""),
                "content": message.get("text","")
            })
        
        chat_item["messages"] = transformed_messages
        transformed_history.append(chat_item)
        
    # We serialize the entire list of chat histories
    return serialize_docs(transformed_history)

async def create_chat_history(username: str, title: str) -> dict:
    history_item = {"title": title, "messages": [], "created_at": datetime.utcnow()}
    
    result = await history_collection.update_one(
        {"username": username, "history.title": {"$ne": title}},
        {"$push": {"history": history_item}},
        upsert=True
    )
    
    if result.modified_count == 0 and result.upserted_id is None:
        raise ValueError(f"Chat with title '{title}' already exists")
    
    return history_item

# app/db.py

async def get_chat_by_title(username: str, title: str) -> dict | None:
    user_history = await history_collection.find_one(
        {"username": username, "history.title": title},
        {"history.$": 1} # Project only the matching chat
    )
    
    if not user_history or "history" not in user_history:
        return None

    # --- THIS IS THE FIX ---
    # Get the raw chat item from the projected array
    chat_item = user_history["history"][0]
    
    transformed_messages = []
    for message in chat_item.get("messages", []):
        # Rename 'sender' to 'role' and 'text' to 'content'
        transformed_messages.append({
            "role": message.get("sender",""),
            "content": message.get("text","")
        })
    
    # Overwrite the old messages list with the new, transformed one
    chat_item["messages"] = transformed_messages
    # --- END OF FIX ---
    
    # Return the fully transformed and serialized chat item
    return serialize_doc(chat_item)

async def add_message_to_chat(username: str, title: str, message: dict):
    return await history_collection.update_one(
        {"username": username, "history.title": title},
        {"$push": {"history.$.messages": message}}
    )

async def delete_chat_history(username: str, titles: list[str]):
    return await history_collection.update_one(
        {"username": username},
        {"$pull": {"history": {"title": {"$in": titles}}}}
    )

# --- Dashboard Collection (Detailed Tracking) ---
async def add_cooked_recipe_dashboard(username: str, recipe_data: dict):
    cooked_item = {
        "username": username,
        "recipe_name": recipe_data["recipe_name"],
        "calories": recipe_data["calories"],
        "cooked_at": recipe_data.get("cooked_at") or datetime.utcnow().isoformat(),
        "servings": recipe_data.get("servings", 1),
        "recipe_data": recipe_data.get("recipe_data", {}),
        "created_at": datetime.utcnow()
    }
    result = await dashboard_collection.insert_one(cooked_item)
    cooked_item['id'] = str(result.inserted_id)
    del cooked_item['_id']
    return cooked_item

async def get_today_cooked_recipes(username: str):
    # FIX: Use utcnow() to avoid timezone issues
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    cooked_recipes = await dashboard_collection.find({
        "username": username,
        "cooked_at": {"$gte": today_start.isoformat()}
    }).sort("cooked_at", -1).to_list(length=None)
    
    return serialize_docs(cooked_recipes)

async def get_recent_cooked_recipes(username: str, limit: int = 10):
    cooked_recipes = await dashboard_collection.find(
        {"username": username}
    ).sort("cooked_at", -1).limit(limit).to_list(length=limit)
    return serialize_docs(cooked_recipes)

async def delete_cooked_recipe_by_id(username: str, recipe_id: ObjectId):
    """FIX: Robust delete using unique _id and username."""
    return await dashboard_collection.delete_one({
        "_id": recipe_id,
        "username": username
    })

async def get_user_dashboard_stats(username: str):
    today_recipes = await get_today_cooked_recipes(username)
    # FIX: Safe sum in case calories is None
    today_calories = sum(recipe.get("calories", 0) for recipe in today_recipes)
    total_recipes = await dashboard_collection.count_documents({"username": username})
    streak = await calculate_cooking_streak(username)
    
    return {
        "today_calories": today_calories,
        "today_recipes_count": len(today_recipes),
        "today_recipes_list": today_recipes,
        "total_recipes_all_time": total_recipes,
        "streak": streak
    }

async def calculate_cooking_streak(username: str):
    all_recipes = await dashboard_collection.find(
        {"username": username}, {"cooked_at": 1}
    ).sort("cooked_at", -1).to_list(length=None)
    
    if not all_recipes:
        return 0
    
    dates_cooked = set()
    for recipe in all_recipes:
        try:
            cooked_date = datetime.fromisoformat(recipe["cooked_at"]).date()
            dates_cooked.add(cooked_date)
        except (ValueError, KeyError):
            continue
    
    sorted_dates = sorted(dates_cooked, reverse=True)
    streak = 0
    # FIX: Use utcnow() for consistent date checking
    current_date = datetime.utcnow().date()
    
    for i, cooked_date in enumerate(sorted_dates):
        days_diff = (current_date - cooked_date).days
        if days_diff == i:
            streak += 1
        else:
            break
    return streak

async def get_weekly_calories(username: str):
    # FIX: Use utcnow() for consistent date checking
    today = datetime.utcnow().date()
    week_data = []
    
    for i in range(7):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        
        day_recipes = await dashboard_collection.find({
            "username": username,
            "cooked_at": {
                "$gte": day_start.isoformat(),
                "$lte": day_end.isoformat()
            }
        }).to_list(length=None)
        
        day_calories = sum(recipe.get("calories", 0) for recipe in day_recipes)
        week_data.append({
            "date": day.isoformat(),
            "day_name": day.strftime("%a"),
            "calories": day_calories,
            "recipes_count": len(day_recipes)
        })
    return week_data[::-1] # Return in chronological order

async def get_cooking_insights(username: str):
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
    
    avg_pipeline = [
        {"$match": {"username": username}},
        {"$group": {
            "_id": None,
            "avg_calories": {"$avg": "$calories"},
            "total_meals": {"$sum": 1}
        }}
    ]
    avg_result = await dashboard_collection.aggregate(avg_pipeline).to_list(length=1)
    
    return {
        "most_cooked_recipes": serialize_docs(most_cooked),
        "average_calories_per_meal": round(avg_result[0]["avg_calories"], 1) if avg_result else 0,
        "total_meals_cooked": avg_result[0]["total_meals"] if avg_result else 0
    }