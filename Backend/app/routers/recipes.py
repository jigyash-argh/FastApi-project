import logging
from fastapi import APIRouter, Depends, HTTPException
from .. import auth, db, chat
from ..models import ChatRequest, RecipeResponse 

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=RecipeResponse)
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(auth.get_current_user)):
    logger.info(f"Chat request from user {current_user['username']}: {request.message}")
    
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # 1. Get the raw recipe data from your chat module
        raw_recipe = chat.get_recipe_and_video(request.message.strip())
        
        # 2. --- FIX: Map the keys to match your RecipeResponse model ---
        # The logs show raw_recipe has "title" and "youtube_link",
        # but your model needs "recipe_name" and "video_url".
        return {
            "recipe_name": raw_recipe.get("title"),  # "title" -> "recipe_name"
            "ingredients": raw_recipe.get("ingredients", []),
            "instructions": raw_recipe.get("instructions", []),
            "video_url": raw_recipe.get("youtube_link"), # "youtube_link" -> "video_url"
            "image_url": raw_recipe.get("image_url")
            # NOTE: Your log shows you also have an "image_url". 
            # You should add "image_url: Optional[str]" to your RecipeResponse
            # model in models.py, then uncomment the line below:
            # "image_url": raw_recipe.get("image_url")
        }

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        fallback_recipe = chat.get_structured_fallback_recipe(request.message)
        
        # 3. --- FIX: Map keys for the fallback recipe as well ---
        return {
            "recipe_name": fallback_recipe.get("title"),
            "ingredients": fallback_recipe.get("ingredients", []),
            "instructions": fallback_recipe.get("instructions", []),
            "video_url": fallback_recipe.get("youtube_link"),
            # "image_url": fallback_recipe.get("image_url")
        }

@router.post("/favorites/{recipe_name}")
async def toggle_favorite(recipe_name: str, current_user: dict = Depends(auth.get_current_user)):
    # This endpoint looks perfect.
    favorites = current_user.get("favorites", [])
    if recipe_name in favorites:
        await db.remove_from_favorites(current_user["username"], recipe_name)
        return {"favorited": False, "message": "Recipe removed from favorites"}
    else:
        await db.add_to_favorite(current_user["username"], recipe_name)
        return {"favorited": True, "message": "Recipe added to favorites"}

@router.get("/favorites")
async def get_favorite(current_user: dict = Depends(auth.get_current_user)):
    # This endpoint also looks perfect.
    favs = await db.get_favorites(current_user["username"])
    return {"favorites": favs}