from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, recipes, history, dashboard  # Fixed import path

app = FastAPI(title="Food-to-Feast API")

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(auth.router, prefix="/api", tags=["Authentication & Users"])
app.include_router(recipes.router, prefix="/api", tags=["Recipes & Chat"])
app.include_router(history.router, prefix="/api", tags=["Chat History"])
app.include_router(dashboard.router, prefix="/api", tags=["User Dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Food-to-Feast API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}