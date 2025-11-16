from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app import auth, db
from app.models import ChatHistoryCreate, ChatHistoryItem, MessageCreate, ChatHistoryDelete, CookedStatusUpdate, MessageCreateWithCooked

router = APIRouter()

@router.get("/history", response_model=List[ChatHistoryItem])
async def get_history(current_user: dict = Depends(auth.get_current_user)):
    return await db.get_chat_history(current_user["username"])

@router.post("/history", response_model=ChatHistoryItem)
async def create_history(chat_item: ChatHistoryCreate, current_user: dict = Depends(auth.get_current_user)):
    try:
        history_item = await db.create_chat_history(current_user["username"], chat_item.title)
        return history_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history/{title}", response_model=ChatHistoryItem)
async def get_chat_by_title(title: str, current_user: dict = Depends(auth.get_current_user)):
    chat = await db.get_chat_by_title(current_user["username"], title)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")

@router.post("/history/{title}/messages")
async def add_message_to_chat(title: str, message: MessageCreateWithCooked, current_user: dict = Depends(auth.get_current_user)):
    await db.add_message_to_chat(current_user["username"], title, message.dict())
    return message

@router.put("/history/{title}/cooked-status")
async def update_cooked_status(title: str, cooked_update: CookedStatusUpdate, current_user: dict = Depends(auth.get_current_user)):
    # CookedStatusUpdate model uses camelCase `isCooked` field; accept either `isCooked` or `is_cooked` for safety
    success = await db.update_message_cooked_status(
        current_user["username"],
        title,
        cooked_update.recipe_name,
        getattr(cooked_update, 'isCooked', getattr(cooked_update, 'is_cooked', False))
    )
    if success:
        return {"message": "Cooked status updated successfully"}
    raise HTTPException(status_code=404, detail="Message not found")

@router.delete("/history")
async def delete_history(delete_request: ChatHistoryDelete, current_user: dict = Depends(auth.get_current_user)):
    result = await db.delete_chat_history(current_user["username"], delete_request.titles)
    if result.modified_count > 0:
        return {"message": "Chat history deleted successfully"}
    raise HTTPException(status_code=404, detail="No matching chat history found")

@router.get("/history/{title}/cooked-status/{recipe_name}")
async def get_cooked_status(title: str, recipe_name: str, current_user: dict = Depends(auth.get_current_user)):
    is_cooked = await db.get_message_cooked_status(current_user["username"], title, recipe_name)
    return {"is_cooked": is_cooked}