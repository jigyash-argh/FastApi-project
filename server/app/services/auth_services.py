from app.repositories.user_repository import get_user_by_email, create_user
from app.core.security import hash_password, verify_password, create_access_token
async def register_user(username:str,email:str,password:str):
    existing_user=get_user_by_email(email)
    if existing_user:
        raise ValueError("User with this email already exists")
    hashed_password=hash_password(password)
    user_data={"username": username, "email": email, "password": hashed_password}
    user_id=create_user(user_data)
    return {"id": user_id, "username": username, "email": email}
async def login_user(email:str,password:str):
    user=get_user_by_email(email)
    if not user:
        raise ValueError("Invalid email or password")
    if not verify_password(password, user["password"]):
        raise ValueError("Invalid email or password")
    access_token=create_access_token(user_id=str(user["_id"]))
    return {"access_token": access_token, "token_type": "Bearer"}