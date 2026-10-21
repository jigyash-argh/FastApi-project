from app.repositories import chat_repository as repo
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
        raise ValueError("Chat not found or access denied.")
    messages = repo.get_chat_messages(chat_id, user_id)
    return messages
def send_message(chat_id: str, user_id: str, content: str):
    content = content.strip()

    if not content:
        raise ValueError("Message cannot be empty")

    chat = repo.get_chat_by_id(chat_id, user_id)

    if not chat:
        return None

    return repo.save_message(
        chat_id=chat_id,
        user_id=user_id,
        role="user",
        content=content,
    )
def rename_chat(chat_id: str, user_id: str, title: str):
    title = title.strip()

    if not title:
        raise ValueError("Chat title cannot be empty")

    return repo.rename_chat(chat_id, user_id, title)


def delete_chat(chat_id: str, user_id: str):
    return repo.delete_chat(chat_id, user_id)