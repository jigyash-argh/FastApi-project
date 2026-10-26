from app.repositories import inventory_repository as repo


def add_item(user_id: str, name: str, quantity: str, food_group: str):
    clean_name = name.strip()
    clean_qty = quantity.strip()
    clean_group = food_group.strip()

    if not clean_name:
        raise ValueError("Ingredient name cannot be empty")
    if not clean_qty:
        raise ValueError("Quantity cannot be empty")
    if not clean_group:
        raise ValueError("Food group cannot be empty")

    return repo.create_item(user_id, clean_name, clean_qty, clean_group)


def get_inventory(user_id: str):
    return repo.get_user_inventory(user_id)


def remove_item(item_id: str, user_id: str) -> bool:
    return repo.delete_item(item_id, user_id)