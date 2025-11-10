# app/routers/history.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from .. import auth, db
from ..models import ChatHistoryCreate, ChatHistoryItem, MessageCreate, ChatHistoryDelete

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
async def add_message_to_chat(title: str, message: MessageCreate, current_user: dict = Depends(auth.get_current_user)):
    await db.add_message_to_chat(current_user["username"], title, message.dict())
    return message

@router.delete("/history")
async def delete_history(delete_request: ChatHistoryDelete, current_user: dict = Depends(auth.get_current_user)):
    result = await db.delete_chat_history(current_user["username"], delete_request.titles)
    if result.modified_count > 0:
        return {"message": "Chat history deleted successfully"}
    raise HTTPException(status_code=404, detail="No matching chat history found")