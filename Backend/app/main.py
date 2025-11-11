# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, recipes, history, dashboard

app = FastAPI(title="Food-to-Feast API")

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    # Update this to your production frontend URL
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(auth.router, tags=["Authentication & Users"])
app.include_router(recipes.router, tags=["Recipes & Chat"])
app.include_router(history.router, tags=["Chat History"])
app.include_router(dashboard.router, tags=["User Dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Food-to-Feast API!"}