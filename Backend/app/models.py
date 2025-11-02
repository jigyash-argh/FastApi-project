# app/models.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- User Models ---

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserPublic(BaseModel):
    username: str
    email: EmailStr
    age: Optional[int] = None
    goal_calories: Optional[int] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None  # Changed from EmailStr to str
    age: Optional[int] = None
    goal_calories: Optional[int] = None
    password: Optional[str] = None

    @validator('email')
    def validate_email_if_provided(cls, v):
        if v is not None and v != "":
            # Basic email validation when email is provided
            if '@' not in v:
                raise ValueError('Invalid email format')
        return v

class UserInDB(BaseModel):
    username: str
    email: EmailStr
    hashed_pass: str

# --- Token Model ---

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Recipe Generator Model ---

class RecipeRequest(BaseModel):
    ingredients: str  # A string of comma-separated ingredients
    
    class Config:
        json_schema_extra = {
            "example": {
                "ingredients": "onions, tomatoes, leftover chicken, rice"
            }
        }
        
class FavoriteRecipe(BaseModel):
    recipe_id: str
    recipe_name: str
    ingredients: Optional[str] = None
    instructions: Optional[List[str]] = None
    image_url: Optional[str] = None

# --- Cooked Recipes Models ---

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

# Add this model to your models.py
class CookedRecipeCreate(BaseModel):
    recipe_name: str
    calories: int
    servings: int = 1
    cooked_at: Optional[str] = None
    recipe_data: Optional[Dict[str, Any]] = None

class CookedRecipeResponse(BaseModel):
    recipe_name: str
    calories: int
    cooked_at: str
    servings: int

class TodayCookedRecipesResponse(BaseModel):
    recipes: List[CookedRecipeResponse]
    total_calories: int
    total_recipes: int

class DashboardStats(BaseModel):
    today_calories: int
    today_recipes: List[CookedRecipeResponse]
    total_recipes: int
    streak: int

class WeeklyCalories(BaseModel):
    date: str
    day_name: str
    calories: int
    recipes_count: int

class WeeklyCaloriesResponse(BaseModel):
    weekly_data: List[WeeklyCalories]

class CookingInsights(BaseModel):
    most_cooked_recipes: List[Dict[str, Any]]
    average_calories_per_meal: float
    total_meals_cooked: int

class HealthMetrics(BaseModel):
    age: Optional[int] = None
    goal_calories: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    dietary_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

# --- Chat Models ---

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    message: str

# --- Chat History Models ---

class Message(BaseModel):
    sender: str
    text: str

class ChatHistoryItem(BaseModel):
    title: str
    messages: List[Message]

class ChatHistoryCreate(BaseModel):
    title: str

class MessageCreate(BaseModel):
    sender: str
    text: str

class ChatHistoryDelete(BaseModel):
    titles: List[str]