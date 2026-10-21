from datetime import datetime
from pydantic import BaseModel, Field


class CreateChatRequest(BaseModel):
    title: str = Field(default="New Chat", min_length=1, max_length=100)


class SendMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


class RenameChatRequest(BaseModel):
    title: str = Field(min_length=1, max_length=100)


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime