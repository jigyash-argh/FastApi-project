from app.repositories import chat_repository as repo
from app.services import user_services,ai_services

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
    past_message=repo.get_chat_messages(chat_id,user_id)
    user_message=repo.save_message(
        chat_id=chat_id,
        user_id=user_id,
        role="user",
        content=content,
    )
    user_settings = user_services.get_settings(user_id)
    ai_reply_content=ai_services.generate_ai_response(user_prompt=content,chat_history=past_message,user_settings=user_settings)
    ai_message=repo.save_message(
        chat_id=chat_id,
        user_id=user_id,
        role="assistant",
        content=ai_reply_content,
    )
    updated_chat = repo.get_chat_by_id(chat_id,user_id)
    return {
        "chat": updated_chat,
        "user_message": user_message,
        "ai_message": ai_message,
    }
def rename_chat(chat_id: str, user_id: str, title: str):
    title = title.strip()

    if not title:
        raise ValueError("Chat title cannot be empty")

    return repo.rename_chat(chat_id, user_id, title)


def delete_chat(chat_id: str, user_id: str):
    return repo.delete_chat(chat_id, user_id)