# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logging
from datetime import datetime
from bson import ObjectId
from app.chat import get_recipe_and_video, get_structured_fallback_recipe
from . import auth, db, chat
from .models import (
    UserCreate, Token, UserPublic, RecipeRequest, 
    ChatHistoryCreate, ChatHistoryItem, MessageCreate, 
    ChatHistoryDelete, ChatRequest, UserUpdate,FavoriteRecipe
)

app = FastAPI(title="Food-to-Feast API")
logger = logging.getLogger(__name__)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Food-to-Feast API!"}


@app.post("/register", response_model=UserPublic)
async def register_user(user: UserCreate):
    """
    Register a new user with username, email, and password
    """
    # Check if username already exists
    existing_user = await db.get_user(user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    # Check if email already exists
    existing_email = await db.user_collection.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash the password (auth.py will handle truncation if needed)
    hashed_password = auth.get_password_hash(user.password)
    
    # Create user document for database
    user_data = {
        "username": user.username,
        "email": user.email,
        "age": 25,
        "goal_calories": 2000,
        "hashed_pass": hashed_password,
        "favorites":[],
        "created_at": datetime.utcnow().isoformat(),
        "cooked":[],
    }

    # Insert into database
    await db.user_collection.insert_one(user_data)
    
    # Return public user data (without password) - include age and goal_calories
    return UserPublic(
        username=user.username, 
        email=user.email,
        age=25,
        goal_calories=2000
    )


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login endpoint - accepts username or email as username field
    """
    user = await db.get_user(form_data.username)
    
    # If not found by username, try by email
    if not user:
        user = await db.user_collection.find_one({"email": form_data.username})
    
    if not user or not auth.verify_password(form_data.password, user["hashed_pass"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
        )
    
    access_token = auth.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserPublic)
async def read_users_me(current_user: dict = Depends(auth.get_current_user)):
    return UserPublic(
        username=current_user["username"], 
        email=current_user["email"],
        age=current_user.get("age", 25),
        goal_calories=current_user.get("goal_calories", 2000)
    )


@app.post("/generate-recipe")
async def generate_recipe(request: RecipeRequest, current_user: dict = Depends(auth.get_current_user)):
    """
    Protected endpoint that takes ingredients and returns an AI-generated recipe
    """
    ingredients_list = request.ingredients.split(',')
    first_ingredient = ingredients_list[0].strip()
    
    return {
        "recipe_name": f"Bachelor's Special {first_ingredient.title()} Delight",
        "ingredients": request.ingredients,
        "instructions": [
            f"1. Heat a pan and add some oil.",
            f"2. Sauté the {request.ingredients}.",
            f"3. Cook for 10-15 minutes until it looks delicious.",
            f"4. Serve hot and enjoy your feast!"
        ],
        "serving_suggestion": "Best served with a side of your favorite TV show."
    }


@app.get("/history", response_model=List[ChatHistoryItem])
async def get_history(current_user: dict = Depends(auth.get_current_user)):
    history = await db.get_chat_history(current_user["username"])
    return history


@app.post("/history", response_model=ChatHistoryItem)
async def create_history(chat_item: ChatHistoryCreate, current_user: dict = Depends(auth.get_current_user)):
    history_item = await db.create_chat_history(current_user["username"], chat_item.title)
    return history_item


@app.get("/history/{title}", response_model=ChatHistoryItem)
async def get_chat_by_title(title: str, current_user: dict = Depends(auth.get_current_user)):
    chat = await db.get_chat_by_title(current_user["username"], title)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")


@app.post("/history/{title}/messages", response_model=MessageCreate)
async def add_message_to_chat(title: str, message: MessageCreate, current_user: dict = Depends(auth.get_current_user)):
    await db.add_message_to_chat(current_user["username"], title, message.dict())
    return message


@app.delete("/history")
async def delete_history(delete_request: ChatHistoryDelete, current_user: dict = Depends(auth.get_current_user)):
    result = await db.delete_chat_history(current_user["username"], delete_request.titles)
    if result.modified_count > 0:
        return {"message": "Chat history deleted successfully"}
    raise HTTPException(status_code=404, detail="No matching chat history found to delete")


@app.post("/chat")
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(auth.get_current_user)):
    """
    Chat endpoint using OpenRouter for recipe generation
    """
    logger.info(f"💬 Chat request from user {current_user.get('username', 'unknown')}: {request.message}")
    
    # Validate input
    if not request.message or not isinstance(request.message, str) or len(request.message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if len(request.message.strip()) > 500:
        raise HTTPException(status_code=400, detail="Message too long")
    
    try:
        # Get structured recipe from OpenRouter
        response = get_recipe_and_video(request.message.strip())
        logger.info("✅ Successfully generated structured recipe response")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error in chat endpoint: {str(e)}")
        # Return fallback response
        fallback_response = get_structured_fallback_recipe(request.message)
        return fallback_response


@app.put("/users/me", response_model=UserPublic)
async def update_user_me(user_update: UserUpdate, current_user: dict = Depends(auth.get_current_user)):
    """
    Update current user details
    """
    update_data = user_update.dict(exclude_unset=True, exclude_none=True)
    
    # Username validation
    if "username" in update_data:
        existing_user = await db.user_collection.find_one({"username": update_data["username"]})
        if existing_user and existing_user["_id"] != current_user["_id"]:
            raise HTTPException(status_code=400, detail="Username already exists")

    # Email validation  
    if "email" in update_data:
        existing_email = await db.user_collection.find_one({"email": update_data["email"]})
        if existing_email and existing_email["_id"] != current_user["_id"]:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    # Password handling - only update if password is provided and not empty
    if "password" in update_data:
        password = update_data.pop("password")
        if password and password.strip():
            update_data["hashed_pass"] = auth.get_password_hash(password)
    
    # Perform update only if there's data to update
    if update_data:
        await db.user_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
    
    # Return updated user
    updated_user = await db.user_collection.find_one({"_id": current_user["_id"]})
    return UserPublic(
        username=updated_user["username"],
        email=updated_user["email"],
        age=updated_user.get("age", 25),
        goal_calories=updated_user.get("goal_calories", 2000)
    )
@app.post("/favorites/{recipe_name}")
async def toggle_favorite(recipe_name: str, current_user: dict = Depends(auth.get_current_user)):
    """Toggle favorite status for a recipe"""
    favorites = current_user.get("favorites", [])
    
    if recipe_name in favorites:
        # Remove from favorites
        await db.remove_from_favorites(current_user["username"], recipe_name)
        return {"favorited": False, "message": "Recipe removed from favorites"}
    else:
        # Add to favorites
        await db.add_to_favorite(current_user["username"], recipe_name)
        return {"favorited": True, "message": "Recipe added to favorites"}
@app.get("/favorites")
async def get_favorite(current_user:dict=Depends(auth.get_current_user)):
    favs=await db.get_favorites(current_user["username"])
    return {"favorites": favs}
