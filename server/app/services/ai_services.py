from dotenv import load_dotenv
import os 
from typing import List, Dict, Any,Optional
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
load_dotenv()
def get_chat_model():
    return init_chat_model(
        "openrouter/free",
        model_provider="openrouter",
        temperature=0.7,
        max_tokens=2048,
        timeout=60,
        max_retries=2,
    )

def build_system_prompt(user_settings: Optional[Dict[str, Any]] = None) -> str:
    diet_pref = "All Everything (no restrictions)"
    if user_settings and isinstance(user_settings, dict):
        diet_pref = user_settings.get("diet_preference") or diet_pref

    return (
        "You are the warm, creative zero-waste AI Chef for 'Fridge to Feast'. "
        "Your mission is to help users turn the ingredients sitting in their fridge "
        "into delicious, practical meals with minimal food waste.\n\n"
        f"User's Default Dietary Preference: {diet_pref}\n\n"
        "Guidelines when suggesting recipes:\n"
        "1. Highlight which of the user's ingredients are used.\n"
        "2. Keep preparation steps clear, numbered, and easy to follow.\n"
        "3. Include estimated prep/cook time and rough calorie or portion notes.\n"
        "4. If the user asks a follow-up question (e.g., 'what can I substitute for eggs?'), "
        "use the conversation history to adapt the current recipe seamlessly."
    )
def generate_ai_response(user_prompt:str,chat_history: Optional[List[Dict[str, Any]]] = None,
    user_settings: Optional[Dict[str, Any]] = None,
    ) -> str:
    model=get_chat_model()
    langchain_messages = [SystemMessage(content=build_system_prompt(user_settings))]
    if(chat_history):
        recent_messages = chat_history[-10:]  # Limit to the last 10 messages for context
        for message in recent_messages:
            role=message.get("role")
            content=message.get("content")
            if not content:
                continue
            if message["role"] == "user":
                langchain_messages.append(HumanMessage(content=message["content"]))
            elif message["role"] == "assistant":
                langchain_messages.append(AIMessage(content=message["content"]))

    langchain_messages.append(HumanMessage(content=user_prompt))
    try:
        response = model.invoke(langchain_messages)
        content = response.content if hasattr(response, "content") else str(response)
        return content.strip() or "I couldn't whip up a response right now. Please try again!"
    except Exception as exc:
        print(f"[AI Service Error]: {exc}")
        return (
            "Our kitchen AI is taking a quick breather right now. "
            "Please try sending your ingredients again in a moment!"
        )
def generate_chat_title(first_message:str) -> str:
    model=get_chat_model()
    system_prompt = (
        "You are a creative AI that generates concise, engaging titles for recipe chats. "
        "Given the user's first message, create a title that captures the essence of the conversation. "
        "Keep it under 10 words and make it appealing."
    )
    langchain_messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=first_message)
    ]
    try:
        response = model.invoke(langchain_messages)
        content = response.content if hasattr(response, "content") else str(response)
        return content.strip() or "Untitled Recipe Chat"
    except Exception as exc:
        print(f"[AI Service Error]: {exc}")
        return "Untitled Recipe Chat"