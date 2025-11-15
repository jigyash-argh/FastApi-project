from fastapi import APIRouter, Depends, HTTPException, Query
from app import auth, db
from app.models import CookedRecipeCreate, CookedRecipeResponse
from bson import ObjectId
from typing import List

router = APIRouter()

@router.post("/cooked-recipe", response_model=CookedRecipeResponse)
async def add_cooked_recipe(recipe_data: CookedRecipeCreate, current_user: dict = Depends(auth.get_current_user)):
    result = await db.add_cooked_recipe_dashboard(current_user["username"], recipe_data.dict())
    return result

@router.get("/cooked-recipes/today")
async def get_today_cooked_recipes(current_user: dict = Depends(auth.get_current_user)):
    stats = await db.get_user_dashboard_stats(current_user["username"])
    return {
        "recipes": stats.get("today_recipes_list", []),
        "total_calories": stats.get("today_calories", 0),
        "total_recipes": stats.get("today_recipes_count", 0),
        "streak": stats.get("streak", 0)
    }

@router.get("/cooked-recipes/recent")
async def get_recent_cooked_recipes(limit: int = Query(10, ge=1, le=50), current_user: dict = Depends(auth.get_current_user)):
    cooked_recipes = await db.get_recent_cooked_recipes(current_user["username"], limit)
    return {"cooked_recipes": cooked_recipes}

@router.delete("/cooked-recipes/{cooked_recipe_id}")
async def delete_cooked_recipe(cooked_recipe_id: str, current_user: dict = Depends(auth.get_current_user)):
    try:
        obj_id = ObjectId(cooked_recipe_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cooked_recipe_id format")
    
    result = await db.delete_cooked_recipe_by_id(current_user["username"], obj_id)
    if result.deleted_count > 0:
        return {"success": True, "message": "Cooked recipe deleted successfully"}
    raise HTTPException(status_code=404, detail="Cooked recipe not found")

@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(auth.get_current_user)):
    stats = await db.get_user_dashboard_stats(current_user["username"])
    return stats

@router.get("/dashboard/weekly-calories")
async def get_weekly_calories_data(current_user: dict = Depends(auth.get_current_user)):
    weekly_data = await db.get_weekly_calories(current_user["username"])
    return {"weekly_data": weekly_data}

@router.get("/dashboard/insights")
async def get_cooking_insights(current_user: dict = Depends(auth.get_current_user)):
    insights = await db.get_cooking_insights(current_user["username"])
    return insights