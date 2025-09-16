# app/models.py
from pydantic import BaseModel, EmailStr

# --- User Models ---

# This model defines the data needed to CREATE a new user.
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# This model is used to safely return user data to the client (without the password).
class UserPublic(BaseModel):
    username: str
    email: EmailStr

# --- Token Model ---

# This model defines the shape of the access token response.
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Recipe Generator Model ---

# This model defines the input for your AI agent.
class RecipeRequest(BaseModel):
    ingredients: str # A string of comma-separated ingredients
    
    class Config:
        json_schema_extra = {
            "example": {
                "ingredients": "onions, tomatoes, leftover chicken, rice"
            }
        }