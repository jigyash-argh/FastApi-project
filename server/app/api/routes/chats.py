from fastapi import APIRouter, Depends, HTTPException, status

from app.api.routes.dependencies import get_current_user
from app.schemas.chat_schema import (
    CreateChatRequest,
    SendMessageRequest,
    RenameChatRequest,
)
from app.services import chat_services as service

router = APIRouter(
    prefix="/chats",
    tags=["Chats"],
)


def get_user_id(current_user) -> str:
    return str(current_user["_id"])


def serialize_chat(chat: dict) -> dict:
    return {
        "id": str(chat["_id"]),
        "title": chat["title"],
        "created_at": chat["created_at"],
        "updated_at": chat["updated_at"],
    }


def serialize_message(message: dict) -> dict:
    return {
        "id": str(message["_id"]),
        "session_id": message["session_id"],
        "role": message["role"],
        "content": message["content"],
        "created_at": message["created_at"],
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_chat(
    payload: CreateChatRequest,
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    try:
        chat = service.create_chat(user_id, payload.title)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return serialize_chat(chat)


@router.get("/")
def get_chats(
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    chats = service.get_user_chats(user_id)

    return [serialize_chat(chat) for chat in chats]


@router.get("/{chat_id}")
def get_chat(
    chat_id: str,
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    result = service.get_chat_messages(chat_id, user_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "chat": serialize_chat(result["chat"]),
        "messages": [
            serialize_message(message)
            for message in result["messages"]
        ],
    }


@router.post(
    "/{chat_id}/messages",
    status_code=status.HTTP_201_CREATED,
)
def send_message(
    chat_id: str,
    payload: SendMessageRequest,
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    try:
        result = service.send_message(
            chat_id,
            user_id,
            payload.content,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "chat": serialize_chat(result["chat"]),
        "user_message": serialize_message(result["user_message"]),
        "ai_message": serialize_message(result["ai_message"]),
    }


@router.patch("/{chat_id}")
def rename_chat(
    chat_id: str,
    payload: RenameChatRequest,
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    try:
        chat = service.rename_chat(
            chat_id,
            user_id,
            payload.title,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return serialize_chat(chat)


@router.delete(
    "/{chat_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_chat(
    chat_id: str,
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    deleted = service.delete_chat(chat_id, user_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )