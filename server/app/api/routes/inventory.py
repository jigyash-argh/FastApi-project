from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.routes.dependencies import get_current_user
from app.schemas.inventory_schema import CreateInventoryItemRequest
from app.services import inventory_services as service

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


def get_user_id(current_user) -> str:
    return str(current_user["_id"])


def serialize_item(item: dict) -> dict:
    created_at = item["created_at"]
    return {
        "id": str(item["_id"]),
        "name": item["name"],
        "quantity": item["quantity"],
        "food_group": item["food_group"],
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else str(created_at),
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_inventory_item(
    payload: CreateInventoryItemRequest,
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)
    try:
        item = service.add_item(user_id, payload.name, payload.quantity, payload.food_group)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return serialize_item(item)


@router.get("/")
def get_inventory_items(
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)
    items = service.get_inventory(user_id)
    return [serialize_item(item) for item in items]


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_item(
    item_id: str,
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)
    deleted = service.remove_item(item_id, user_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Inventory item not found")