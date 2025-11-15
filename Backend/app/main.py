from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, recipes, history, dashboard

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
# Add /v1 to match what your frontend is expecting
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication & Users"])
app.include_router(recipes.router, prefix="/api/v1", tags=["Recipes & Chat"])
app.include_router(history.router, prefix="/api/v1", tags=["Chat History"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["User Dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Food-to-Feast API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}