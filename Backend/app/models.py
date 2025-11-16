from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(min_length=6)
    age: Optional[int] = 25
    goal_calories: Optional[int] = 2000

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    age: Optional[int] = None
    goal_calories: Optional[int] = None

class UserPublic(UserBase):
    age: Optional[int]
    goal_calories: Optional[int]
    id: Optional[str] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class MessageCreate(BaseModel):
    role: str
    content: str

class ChatHistoryItem(BaseModel):
    title: str
    messages: List[MessageCreate]
    created_at: Optional[str] = None

class ChatHistoryCreate(BaseModel):
    title: str

class ChatHistoryDelete(BaseModel):
    titles: List[str]

class ChatRequest(BaseModel):
    message: str

class RecipeResponse(BaseModel):
    recipe_name: str
    instructions: List[str]
    ingredients: List[str]
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    # Additional fields for compatibility
    title: Optional[str] = None
    prepTime: Optional[str] = None
    cookTime: Optional[str] = None
    servings: Optional[str] = None
    calories_per_serving: Optional[int] = None
    
    @validator('recipe_name', pre=True, always=True)
    def set_recipe_name(cls, v, values):
        if not v and values.get('title'):
            return values['title']
        return v or "Unknown Recipe"

class CookedRecipeCreate(BaseModel):
    recipe_name: str
    calories: int
    cooked_at: Optional[str] = None
    servings: Optional[int] = 1
    recipe_data: Optional[dict] = {}

class CookedRecipeResponse(CookedRecipeCreate):
    id: str
    username: str
    created_at: datetime

class HealthMetricsUpdate(BaseModel):
    age: Optional[int] = None
    goal_calories: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    dietary_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

class CookedStatusUpdate(BaseModel):
    title:str
    recipe_name:str
    isCooked:bool

class MessageCreateWithCooked(BaseModel):
    role: str
    content: str
    is_cooked: Optional[bool] = False