# app/main.py

from .. import db
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import your auth and new db modules
from . import auth

app = FastAPI()

# --- CORS Middleware ---
# Allows your React frontend to communicate with this backend
origins = [
    "http://localhost:3000",  # Default for create-react-app
    "http://localhost:5173",  # Default for Vite + React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
# These models define the shape of the data for requests and responses

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    full_name: str | None = None
    email: str | None = None

# --- API Endpoints ---

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Handles user login. Takes username and password from a form,
    verifies them, and returns a JWT access token.
    """
    # Get the user from our db module instead of a local dictionary
    user = db.get_user(form_data.username)
    
    # Verify the user exists and the password is correct
    if not user or not auth.verify_password(form_data.password, user["hashed_pass"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create the access token for the user
    access_token = auth.create_access_token(data={"sub": user["username"]})
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: dict = Depends(auth.get_current_user)):
    """
    A protected endpoint to get the current authenticated user's data.
    The `Depends(auth.get_current_user)` dependency handles all the
    token validation and user fetching.
    """
    # 'current_user' is the full user dictionary provided by the dependency.
    # It's already validated and ready to be returned.
    return current_user