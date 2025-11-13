# app/models.py
from pydantic import BaseModel, EmailStr, Field
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
    video_url: Optional[str]
    image_url: Optional[str]

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