from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth
from app.core.config import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}/{name}")
def read_item(item_id: int, name: str = "Default Name"):
    items = {
        "1": "Item One",
        "2": "Item Two",
        "3": "Item Three"
    }

    return {
        "item_id": item_id,
        "item_name": items.get(str(item_id), "Item not found"),
        "name": name
    }