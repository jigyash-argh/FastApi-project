import asyncio
import json
from datetime import datetime
from typing import Any, Dict, Iterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse

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
    created_at = chat["created_at"]
    updated_at = chat["updated_at"]
    return {
        "id": str(chat["_id"]),
        "title": chat["title"],
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else str(created_at),
        "updated_at": updated_at.isoformat() if isinstance(updated_at, datetime) else str(updated_at),
    }


def serialize_message(message: dict) -> dict:
    created_at = message["created_at"]
    return {
        "id": str(message["_id"]),
        "session_id": message["session_id"],
        "role": message["role"],
        "content": message["content"],
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else str(created_at),
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
    summary="Send a message (completed JSON response)",
    description="Waits for the full AI response. Use the streaming endpoint to receive tokens as they are generated.",
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


def encode_message_events(events: Iterator[Dict[str, Any]]) -> Iterator[str]:
    try:
        for event in events:
            event_name = event["event"]
            data = event["data"]
            if event_name == "user_message":
                data = serialize_message(data)
            elif event_name == "complete":
                data = {
                    "chat": serialize_chat(data["chat"]),
                    "user_message": serialize_message(data["user_message"]),
                    "ai_message": serialize_message(data["ai_message"]),
                }
            yield (
                f"event: {event_name}\n"
                f"data: {json.dumps(jsonable_encoder(data), ensure_ascii=False, separators=(',', ':'))}"
                "\n\n"
            )
    except (asyncio.CancelledError, GeneratorExit):
        return


@router.post(
    "/{chat_id}/messages/stream",
    status_code=status.HTTP_201_CREATED,
    response_class=StreamingResponse,
    summary="Stream a chat response",
    description=(
        "Streams server-sent events: `user_message`, one or more `token` events, "
        "then `complete`; provider failures are sent as an `error` event. "
        "Use the completed JSON endpoint if a non-streaming response is required."
    ),
    responses={
        status.HTTP_201_CREATED: {
            "description": "Server-sent events containing the persisted messages.",
            "content": {"text/event-stream": {"schema": {"type": "string"}}},
        }
    },
)
def stream_chat_message(
    chat_id: str,
    payload: SendMessageRequest,
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    try:
        events = service.stream_message(chat_id, user_id, payload.content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    if events is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return StreamingResponse(
        encode_message_events(events),
        status_code=status.HTTP_201_CREATED,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


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