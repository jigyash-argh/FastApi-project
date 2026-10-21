from pydantic import BaseModel, EmailStr, Field
from typing import Literal


class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str = Field(..., min_length=3)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"


class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=50)
    email: EmailStr | None = None


class UserSettingsUpdate(BaseModel):
    dietary_preference: Literal[
        "none", "vegetarian", "vegan", "non_vegetarian"
    ] | None = None

    cooking_skill: Literal[
        "beginner", "intermediate", "advanced"
    ] | None = None

    measurement_unit: Literal["metric", "imperial"] | None = None

    theme: Literal["light", "dark", "system"] | None = None
