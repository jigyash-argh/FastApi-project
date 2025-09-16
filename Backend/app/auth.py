# app/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone

from . import db
from .config import settings  # <-- IMPORT from our new config file

# This is for hashing passwords.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# This tells FastAPI where the login endpoint is.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Function to check if a plain password matches a hashed one.
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Function to hash a new password.
def get_password_hash(password):
    return pwd_context.hash(password)

# Function to create a JWT access token.
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Dependency to get the current logged-in user from a token.
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.get_user(username=username)
    if user is None:
        raise credentials_exception
    return user