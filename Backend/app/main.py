# main.py
from fastapi import FastAPI
from typing import Optional
from . import auth
app = FastAPI()

@app.get("/")
def home():
    """
    Root endpoint that returns a welcome message.
    """
    return {"message": "Hello, FastAPI is running!"}

@app.get("/items/{item_id}")
def get_item(item_id: int, q: Optional[str] = None):
    """
    Endpoint to retrieve an item by its ID.
    - item_id: A required integer path parameter.
    - q: An optional string query parameter.
    """
    return {"item_id": item_id, "query": q}