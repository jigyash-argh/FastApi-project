import logging
from fastapi import APIRouter, Depends, HTTPException
from app import auth, db, chat
from app.models import ChatRequest, RecipeResponse

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=RecipeResponse)
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(auth.get_current_user)):
    logger.info(f"Chat request from user {current_user['username']}: {request.message}")
    
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # Get recipe data from chat module
        raw_recipe = chat.get_recipe_and_video(request.message.strip())
        
        # Transform to match RecipeResponse model
        recipe_response = {
            "recipe_name": raw_recipe.get("recipe_name", raw_recipe.get("title", f"Delicious {request.message}")),
            "instructions": raw_recipe.get("instructions", []),
            "ingredients": raw_recipe.get("ingredients", []),
            "video_url": raw_recipe.get("video_url", raw_recipe.get("youtube_link")),
            "image_url": raw_recipe.get("image_url"),
            # Additional fields for compatibility
            "title": raw_recipe.get("title"),
            "prepTime": raw_recipe.get("prepTime"),
            "cookTime": raw_recipe.get("cookTime"),
            "servings": raw_recipe.get("servings"),
            "calories_per_serving": raw_recipe.get("calories_per_serving", 350)
        }
        
        return RecipeResponse(**recipe_response)

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        fallback_recipe = chat.get_structured_fallback_recipe(request.message)
        
        fallback_response = {
            "recipe_name": fallback_recipe.get("recipe_name", fallback_recipe.get("title")),
            "instructions": fallback_recipe.get("instructions", []),
            "ingredients": fallback_recipe.get("ingredients", []),
            "video_url": fallback_recipe.get("video_url", fallback_recipe.get("youtube_link")),
            "image_url": fallback_recipe.get("image_url"),
            "title": fallback_recipe.get("title"),
            "prepTime": fallback_recipe.get("prepTime"),
            "cookTime": fallback_recipe.get("cookTime"),
            "servings": fallback_recipe.get("servings"),
            "calories_per_serving": fallback_recipe.get("calories_per_serving", 400)
        }
        
        return RecipeResponse(**fallback_response)

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
async def get_favorites(current_user: dict = Depends(auth.get_current_user)):
    favs = await db.get_favorites(current_user["username"])
    return {"favorites": favs}