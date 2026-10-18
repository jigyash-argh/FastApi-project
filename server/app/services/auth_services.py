from app.repositories.user_repository import get_user_by_email, create_user
from app.core.security import hash_password, verify_password, create_access_token
async def register_user(name:str,email:str,password:str):
    existing_user=get_user_by_email(email)
    if existing_user:
        raise ValueError("User with this email already exists")
    hashed_password=hash_password(password)
    user_data={"username": name, "email": email, "password": hashed_password}
    user_id=create_user(user_data)
    return {"id": user_id, "username": name, "email": email}
