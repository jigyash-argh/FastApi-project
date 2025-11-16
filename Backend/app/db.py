import motor.motor_asyncio 
from app.config import settings
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any, Optional

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
    
    doc = doc.copy()
    if '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    
    # Convert ObjectId and datetime to strings
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

def serialize_docs(docs):
    return [serialize_doc(doc) for doc in docs]

# --- User Collection ---
async def get_user(username: str) -> Optional[Dict]:
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
    update_data = {key: value for key, value in metrics.items() if value is not None}
    if update_data:
        result = await user_collection.update_one(
            {"username": username},
            {"$set": update_data}
        )
        return result
    return None

# --- Favorites ---
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
async def get_chat_history(username: str) -> List[Dict]:
    history_doc = await history_collection.find_one({"username": username})
    
    if not history_doc or "history" not in history_doc:
        return []

    transformed_history = []
    for chat_item in history_doc.get("history", []):
        transformed_messages = []
        for message in chat_item.get("messages", []):
            transformed_messages.append({
                "role": message.get("sender", message.get("role", "")),
                "content": message.get("text", message.get("content", ""))
            })
        
        transformed_chat = {
            "title": chat_item.get("title"),
            "messages": transformed_messages,
            "created_at": chat_item.get("created_at")
        }
        transformed_history.append(transformed_chat)
        
    return serialize_docs(transformed_history)

async def create_chat_history(username: str, title: str) -> Dict:
    history_item = {
        "title": title, 
        "messages": [], 
        "created_at": datetime.utcnow()
    }
    
    result = await history_collection.update_one(
        {"username": username, "history.title": {"$ne": title}},
        {"$push": {"history": history_item}},
        upsert=True
    )
    
    if result.modified_count == 0 and result.upserted_id is None:
        raise ValueError(f"Chat with title '{title}' already exists")
    
    return serialize_doc(history_item)

async def get_chat_by_title(username: str, title: str) -> Optional[Dict]:
    user_history = await history_collection.find_one(
        {"username": username, "history.title": title},
        {"history.$": 1}
    )
    
    if not user_history or "history" not in user_history:
        return None

    chat_item = user_history["history"][0]
    
    transformed_messages = []
    for message in chat_item.get("messages", []):
        transformed_messages.append({
            "role": message.get("sender", message.get("role", "")),
            "content": message.get("text", message.get("content", ""))
        })
    
    chat_item["messages"] = transformed_messages
    return serialize_doc(chat_item)

async def add_message_to_chat(username: str, title: str, message: Dict):
    result = await history_collection.update_one(
        {"username": username, "history.title": title},
        {"$push": {"history.$.messages": message}}
    )
    return result.modified_count > 0

async def delete_chat_history(username: str, titles: List[str]):
    result = await history_collection.update_one(
        {"username": username},
        {"$pull": {"history": {"title": {"$in": titles}}}}
    )
    return result

# --- Dashboard Collection ---
async def add_cooked_recipe_dashboard(username: str, recipe_data: Dict) -> Dict:
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
    return serialize_doc(cooked_item)

async def get_today_cooked_recipes(username: str) -> List[Dict]:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    cooked_recipes = await dashboard_collection.find({
        "username": username,
        "cooked_at": {"$gte": today_start.isoformat()}
    }).sort("cooked_at", -1).to_list(length=None)
    
    return serialize_docs(cooked_recipes)

async def get_recent_cooked_recipes(username: str, limit: int = 10) -> List[Dict]:
    cooked_recipes = await dashboard_collection.find(
        {"username": username}
    ).sort("cooked_at", -1).limit(limit).to_list(length=limit)
    return serialize_docs(cooked_recipes)

async def delete_cooked_recipe_by_id(username: str, recipe_id: ObjectId):
    return await dashboard_collection.delete_one({
        "_id": recipe_id,
        "username": username
    })

async def get_user_dashboard_stats(username: str) -> Dict:
    today_recipes = await get_today_cooked_recipes(username)
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

async def calculate_cooking_streak(username: str) -> int:
    all_recipes = await dashboard_collection.find(
        {"username": username}, {"cooked_at": 1}
    ).sort("cooked_at", -1).to_list(length=None)
    
    if not all_recipes:
        return 0
    
    dates_cooked = set()
    for recipe in all_recipes:
        try:
            cooked_at = recipe.get("cooked_at")
            if isinstance(cooked_at, str):
                cooked_date = datetime.fromisoformat(cooked_at.replace('Z', '+00:00')).date()
            else:
                cooked_date = cooked_at.date()
            dates_cooked.add(cooked_date)
        except (ValueError, KeyError, AttributeError):
            continue
    
    sorted_dates = sorted(dates_cooked, reverse=True)
    streak = 0
    current_date = datetime.utcnow().date()
    
    for i, cooked_date in enumerate(sorted_dates):
        days_diff = (current_date - cooked_date).days
        if days_diff == i:
            streak += 1
        else:
            break
    return streak

async def get_weekly_calories(username: str) -> List[Dict]:
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
    return week_data[::-1]

async def get_cooking_insights(username: str) -> Dict:
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

async def update_message_cooked_status(username: str, title: str, recipe_name: str, is_cooked: bool):
    """Update the cooked status of a specific message in chat history"""
    result = await history_collection.update_one(
        {
            "username": username,
            "history.title": title,
            "history.messages.content": {"$regex": recipe_name}
        },
        {
            "$set": {"history.$[chat].messages.$[msg].is_cooked": is_cooked}
        },
        array_filters=[
            {"chat.title": title},
            {"msg.content": {"$regex": recipe_name}}
        ]
    )
    return result.modified_count > 0

async def get_message_cooked_status(username: str, title: str, recipe_name: str):
    """Get the cooked status of a specific message"""
    chat = await history_collection.find_one(
        {
            "username": username,
            "history.title": title
        },
        {"history.$": 1}
    )
    
    if chat and "history" in chat:
        for message in chat["history"][0].get("messages", []):
            if recipe_name in message.get("content", ""):
                return message.get("is_cooked", False)
    return False