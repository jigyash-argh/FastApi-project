# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

# Import all our custom modules
from . import auth, db
from .models import UserCreate, Token, UserPublic, RecipeRequest

app = FastAPI(title="Food-to-Feast API")

# --- CORS Middleware ---
# This allows your React app (running on a different port) to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Food-to-Feast API!"}

# Endpoint to register a new user
@app.post("/register", response_model=UserPublic)
async def register_user(user: UserCreate):
    existing_user = await db.get_user(user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    hashed_password = auth.get_password_hash(user.password)
    
    # Prepare user data for database, replacing plain password with hashed one
    user_data = user.model_dump()
    user_data["hashed_pass"] = hashed_password
    del user_data["password"]

    await db.user_collection.insert_one(user_data)
    
    return user_data

# Endpoint for user login
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.get_user(form_data.username)
    if not user or not auth.verify_password(form_data.password, user["hashed_pass"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token = auth.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# A protected endpoint to get the current user's details
@app.get("/users/me", response_model=UserPublic)
async def read_users_me(current_user: dict = Depends(auth.get_current_user)):
    return current_user

# The CORE endpoint for your AI agent!
@app.post("/generate-recipe")
async def generate_recipe(request: RecipeRequest, current_user: dict = Depends(auth.get_current_user)):
    """
    This is a protected endpoint that takes a list of ingredients
    and returns an AI-generated recipe.
    """
    # **THIS IS WHERE YOU WOULD CALL YOUR AI MODEL**
    # For now, we'll return a simple, hardcoded response.
    
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