
import motor.motor_asyncio 
from .config import settings  # <-- IMPORT from our new config file
from datetime import datetime,timedelta
# This is the main connection to your MongoDB database
# It now uses the DATABASE_URL from the central settings object
client = motor.motor_asyncio.AsyncIOMotorClient(settings.DATABASE_URL)

# We get a specific database from our MongoDB cluster
database = client.FoodToFeastDB

# We get a specific "collection" where we'll store users
user_collection = database.get_collection("users")
history_collection = database.get_collection("history")
dashboard_collection=database.get_collection("dashboard")
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
    
    # Use $addToSet with $each to prevent duplicates based on title
    result = await history_collection.update_one(
        {"username": username, "history.title": {"$ne": title}},  # Only update if title doesn't exist
        {"$push": {"history": history_item}},
        upsert=True
    )
    
    # If no document was modified, it means the title already exists
    if result.modified_count == 0:
        # Fetch and return the existing chat
        user_doc = await history_collection.find_one({"username": username})
        for item in user_doc.get("history", []):
            if item.get("title") == title:
                return item
        # This shouldn't happen, but just in case
        raise ValueError(f"Chat with title '{title}' already exists")
    
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

#favorites
# In your db.py file

async def add_to_favorite(username: str, recipe_name: str):
    """Add a recipe to user's favorites"""
    return await user_collection.update_one(
        {"username": username},
        {"$addToSet": {"favorites": recipe_name}}  # Use $addToSet to avoid duplicates
    )

async def remove_from_favorites(username: str, recipe_name: str):
    """Remove a recipe from user's favorites"""
    return await user_collection.update_one(
        {"username": username},
        {"$pull": {"favorites": recipe_name}}  # Use $pull to remove from array
    )

async def get_favorites(username: str):
    """Get user's favorite recipes"""
    user = await user_collection.find_one({"username": username})
    return user.get("favorites", []) if user else []

#cooked
async def add_to_cooked(username:str,recipe_name:str):
    return await user_collection.update_one(
        {"username":username},
        {
            "$addToSet":{"cooked":recipe_name}
        }
    )
async def remove_from_cooked(username:str,recipe_name:str):
    return await user_collection.update_one(
        {"username":username},
        {"$pull":{"cooked":recipe_name}}
    )
async def get_cooked(username:str):
    user=await user_collection.find_one({"username":username})
    return user.get("cooked",[]) if user else []

#dashboard
# DASHBOARD COLLECTION FUNCTIONS - For detailed tracking with calories

async def add_cooked_recipe_dashboard(username: str, recipe_data: dict):
    """
    Add detailed cooked recipe data to dashboard collection
    recipe_data should contain: recipe_name, calories, cooked_at, servings, recipe_data
    """
    cooked_item = {
        "username": username,
        "recipe_name": recipe_data["recipe_name"],
        "calories": recipe_data["calories"],
        "cooked_at": recipe_data.get("cooked_at", datetime.utcnow().isoformat()),
        "servings": recipe_data.get("servings", 1),
        "recipe_data": recipe_data.get("recipe_data", {}),
        "created_at": datetime.utcnow()
    }
    
    return await dashboard_collection.insert_one(cooked_item)

async def get_today_cooked_recipes(username: str):
    """
    Get all recipes cooked by user today with calorie data
    """
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    cooked_recipes = await dashboard_collection.find({
        "username": username,
        "cooked_at": {"$gte": today_start.isoformat()}
    }).sort("cooked_at", -1).to_list(length=None)
    
    return cooked_recipes

async def get_user_dashboard_stats(username: str):
    """
    Get comprehensive dashboard statistics for the user
    Returns: today_calories, today_recipes, total_recipes, streak
    """
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
    """
    Calculate user's current cooking streak (consecutive days with cooked recipes)
    """
    # Get all cooked recipes sorted by date
    all_recipes = await dashboard_collection.find(
        {"username": username}
    ).sort("cooked_at", -1).to_list(length=None)
    
    if not all_recipes:
        return 0
    
    # Get unique dates when user cooked
    dates_cooked = set()
    for recipe in all_recipes:
        cooked_date = datetime.fromisoformat(recipe["cooked_at"]).date()
        dates_cooked.add(cooked_date)
    
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
    """
    Get weekly calorie data for charts (last 7 days)
    """
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
            "day_name": day.strftime("%a"),  # Mon, Tue, etc.
            "calories": day_calories,
            "recipes_count": len(day_recipes)
        })
    
    return week_data[::-1]  # Reverse to get oldest first

async def get_user_health_metrics(username: str):
    """
    Get user's health metrics and goals
    """
    user = await user_collection.find_one({"username": username})
    if not user:
        return None
    
    return {
        "age": user.get("age", 25),
        "goal_calories": user.get("goal_calories", 2200),
        "weight": user.get("weight"),
        "height": user.get("height"),
        "dietary_preferences": user.get("dietary_preferences", []),
        "allergies": user.get("allergies", [])
    }

async def update_user_health_metrics(username: str, metrics: dict):
    """
    Update user's health metrics
    """
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
    """
    Get insights about user's cooking habits
    """
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
    """
    Delete a cooked recipe entry using recipe_name and cooked_at timestamp
    """
    return await dashboard_collection.delete_one({
        "username": username,
        "recipe_name": recipe_name,
        "cooked_at": cooked_at
    })

async def get_recent_cooked_recipes(username: str, limit: int = 10):
    """
    Get recent cooked recipes for the user
    """
    return await dashboard_collection.find({
        "username": username
    }).sort("cooked_at", -1).limit(limit).to_list(length=limit)