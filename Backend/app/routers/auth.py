# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from .. import auth, db
from ..models import UserCreate, Token, UserPublic, UserUpdate, HealthMetricsUpdate

router = APIRouter()

@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    existing_user = await db.user_collection.find_one({
        "$or": [{"username": user.username}, {"email": user.email}]
    })
    if existing_user:
        detail = "Username already registered" if existing_user["username"] == user.username else "Email already registered"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    hashed_password = auth.get_password_hash(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "age": user.age or 25,
        "goal_calories": user.goal_calories or 2000,
        "hashed_pass": hashed_password,
        "favorites": [],
        "created_at": datetime.utcnow().isoformat(),
    }
    await db.user_collection.insert_one(user_data)
    
    return UserPublic(**user_data)


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.get_user(form_data.username)
    if not user:
        user_doc = await db.user_collection.find_one({"email": form_data.username})
        if user_doc:
            user = db.serialize_doc(user_doc)
    
    if not user or not auth.verify_password(form_data.password, user["hashed_pass"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
        )
    
    access_token = auth.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=UserPublic)
async def read_users_me(current_user: dict = Depends(auth.get_current_user)):
    return UserPublic(**current_user)


@router.put("/users/me", response_model=UserPublic)
async def update_user_me(user_update: UserUpdate, current_user: dict = Depends(auth.get_current_user)):
    update_data = user_update.dict(exclude_unset=True, exclude_none=True)
    
    if "username" in update_data:
        existing_user = await db.user_collection.find_one({"username": update_data["username"]})
        if existing_user and existing_user["_id"] != current_user["_id"]:
            raise HTTPException(status_code=400, detail="Username already exists")

    if "email" in update_data:
        existing_email = await db.user_collection.find_one({"email": update_data["email"]})
        if existing_email and existing_email["_id"] != current_user["_id"]:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    if "password" in update_data:
        password = update_data.pop("password")
        if password and password.strip():
            update_data["hashed_pass"] = auth.get_password_hash(password)
    
    if update_data:
        await db.user_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
    
    updated_user = await db.user_collection.find_one({"_id": current_user["_id"]})
    return UserPublic(**db.serialize_doc(updated_user))

@router.get("/users/me/health-metrics")
async def get_health_metrics(current_user: dict = Depends(auth.get_current_user)):
    metrics = await db.get_user_health_metrics(current_user["username"])
    if not metrics:
        raise HTTPException(status_code=404, detail="User metrics not found")
    return metrics

@router.put("/users/me/health-metrics")
async def update_health_metrics(metrics: HealthMetricsUpdate, current_user: dict = Depends(auth.get_current_user)):
    await db.update_user_health_metrics(current_user["username"], metrics.dict(exclude_unset=True))
    return {"message": "Health metrics updated successfully"}