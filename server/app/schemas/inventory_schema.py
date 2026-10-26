from typing import Optional
from pydantic import BaseModel, Field


class CreateInventoryItemRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    quantity: str = Field(..., min_length=1, max_length=50) # e.g., "1", "2 bunches", "500g"
    food_group: str = Field(..., min_length=1, max_length=50) # e.g., "Produce", "Dairy"


class UpdateInventoryItemRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    quantity: Optional[str] = Field(None, min_length=1, max_length=50)
    food_group: Optional[str] = Field(None, min_length=1, max_length=50)