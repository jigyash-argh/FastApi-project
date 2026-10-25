
import logging
from typing import Any, Dict, Iterator, List, Optional

from app.repositories import chat_repository as repo
from app.services import ai_services, user_services

logger = logging.getLogger(__name__)


def create_chat(user_id: str, title: str):
    title = title.strip()

    if not title:
        raise ValueError("Chat title cannot be empty.")

    return repo.create_chat(user_id, title)


def get_user_chats(user_id: str):
    return repo.get_user_chats(user_id)


def get_chat_messages(chat_id: str, user_id: str):
    chat = repo.get_chat_by_id(chat_id, user_id)

    if not chat:
        return None

    messages = repo.get_chat_messages(chat_id, user_id)

    return {
        "chat": chat,
        "messages": messages,
    }


def send_message(chat_id: str, user_id: str, content: str):
    content = content.strip()

    if not content:
        raise ValueError("Message cannot be empty")

    chat = repo.get_chat_by_id(chat_id, user_id)

    if not chat:
        return None

    past_messages = repo.get_chat_messages(chat_id, user_id)

    user_message = repo.save_message(
        chat_id=chat_id,
        user_id=user_id,
        role="user",
        content=content,
    )

    user_settings = user_services.get_settings(user_id)

    ai_reply_content = ai_services.generate_ai_response(
        user_prompt=content,
        chat_history=past_messages,
        user_settings=user_settings,
    )

    ai_message = repo.save_message(
        chat_id=chat_id,
        user_id=user_id,
        role="assistant",
        content=ai_reply_content,
    )

    updated_chat = repo.get_chat_by_id(chat_id, user_id)

    return {
        "chat": updated_chat,
        "user_message": user_message,
        "ai_message": ai_message,
    }


def stream_message(
    chat_id: str,
    user_id: str,
    content: str,
) -> Optional[Iterator[Dict[str, Any]]]:
    content = content.strip()

    if not content:
        raise ValueError("Message cannot be empty")

    chat = repo.get_chat_by_id(chat_id, user_id)

    if not chat:
        return None

    past_messages = repo.get_chat_messages(chat_id, user_id)

    user_message = repo.save_message(
        chat_id=chat_id,
        user_id=user_id,
        role="user",
        content=content,
    )

    user_settings = user_services.get_settings(user_id)

    def generate_events() -> Iterator[Dict[str, Any]]:
        yield {
            "event": "user_message",
            "data": user_message,
        }

        response_parts: List[str] = []

        try:
            for token in ai_services.stream_ai_response(
                user_prompt=content,
                chat_history=past_messages,
                user_settings=user_settings,
            ):
                if token:
                    response_parts.append(token)

                    yield {
                        "event": "token",
                        "data": token,
                    }

            response_content = "".join(response_parts).strip()

            if not response_content:
                raise RuntimeError("AI returned an empty response")

            ai_message = repo.save_message(
                chat_id=chat_id,
                user_id=user_id,
                role="assistant",
                content=response_content,
            )

            updated_chat = repo.get_chat_by_id(chat_id, user_id)

            if not updated_chat:
                raise RuntimeError(
                    "Chat disappeared while saving the AI response"
                )

            yield {
                "event": "complete",
                "data": {
                    "chat": updated_chat,
                    "user_message": user_message,
                    "ai_message": ai_message,
                },
            }

        except GeneratorExit:
            logger.info("Client disconnected from chat stream")
            raise

        except Exception:
            logger.exception("Streaming AI response failed")

            yield {
                "event": "error",
                "data": {
                    "detail": (
                        "The AI response could not be completed. "
                        "Please try again."
                    )
                },
            }

    return generate_events()


def rename_chat(chat_id: str, user_id: str, title: str):
    title = title.strip()

    if not title:
        raise ValueError("Chat title cannot be empty")

    return repo.rename_chat(chat_id, user_id, title)


def delete_chat(chat_id: str, user_id: str):
    return repo.delete_chat(chat_id, user_id)
