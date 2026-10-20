from pydantic import BaseModel, EmailStr, Field
class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, description="User's username")
    password: str = Field(..., min_length=8, description="User's password")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password")
class UserResponse(BaseModel):
    id: str = Field(..., description="User's unique identifier")
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, description="User's username")

class TokenResponse(BaseModel): 
    access_token: str = Field(..., description="JWT access token")
    token_type:str="Bearer" 