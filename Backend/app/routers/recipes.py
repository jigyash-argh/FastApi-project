# app/routers/recipes.py
import logging
from fastapi import APIRouter, Depends, HTTPException
from .. import auth, db, chat
from ..models import ChatRequest, RecipeResponse # Assuming you have these models

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=RecipeResponse)
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(auth.get_current_user)):
    logger.info(f"Chat request from user {current_user['username']}: {request.message}")
    
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        response = chat.get_recipe_and_video(request.message.strip())
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return chat.get_structured_fallback_recipe(request.message)

@router.post("/favorites/{recipe_name}")
async def toggle_favorite(recipe_name: str, current_user: dict = Depends(auth.get_current_user)):
    favorites = current_user.get("favorites", [])
    if recipe_name in favorites:
        await db.remove_from_favorites(current_user["username"], recipe_name)
        return {"favorited": False, "message": "Recipe removed from favorites"}
    else:
        await db.add_to_favorite(current_user["username"], recipe_name)
        return {"favorited": True, "message": "Recipe added to favorites"}

@router.get("/favorites")
async def get_favorite(current_user: dict = Depends(auth.get_current_user)):
    favs = await db.get_favorites(current_user["username"])
    return {"favorites": favs}