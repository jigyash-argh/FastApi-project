# app/models.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
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
#cooked recipe 
class Cooked_recipe(BaseModel):
    recipe_id:str
    recipe_name:str
    recipe_calories:int
    recipe_for_num:int 
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
