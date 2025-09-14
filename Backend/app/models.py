from pydantic import BaseModel, EmailStr, Field
class UserinDb(BaseModel):
    name:str
    email:EmailStr
    hashed_pass:str
class CreateUser(BaseModel):
    name:str
    email:EmailStr
    password:str

class 