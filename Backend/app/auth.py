# app/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional

from . import db
from .config import settings

# Bcrypt has a 72-byte limit for passwords
MAX_PASSWORD_BYTES = 72

# Password context for hashing and verification
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


def _truncate_password(password: str) -> str:
    """
    Truncate the password so its UTF-8 encoded form
    does not exceed bcrypt's 72-byte limit.
    """
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > MAX_PASSWORD_BYTES:
        pw_bytes = pw_bytes[:MAX_PASSWORD_BYTES]
        # decode safely ignoring incomplete UTF-8 chars at end
        password = pw_bytes.decode("utf-8", errors="ignore")
    return password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    Automatically handles password truncation if needed.
    """
    plain_password = _truncate_password(plain_password)
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    Automatically handles password truncation if needed.
    """
    password = _truncate_password(password)
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with optional custom expiration.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Get the current authenticated user from the JWT token.
    """
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


async def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Optional: Use this if you want to add active user validation in the future.
    For example, if you add an 'is_active' field to users.
    """
    # Example: if you add user status in the future
    # if not current_user.get("is_active", True):
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Optional: Token validation function
def validate_token(token: str) -> dict:
    """
    Validate a JWT token without dependency injection.
    Useful for background tasks or external validation.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return payload
    except JWTError:
        return None