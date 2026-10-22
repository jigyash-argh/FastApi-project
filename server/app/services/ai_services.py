from dotenv import load_dotenv
import os   
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage,AIMessage,SystemMessage
load_dotenv()  # Load environment variables from .env file
llm = init_chat_model(
    "openrouter/free",
    model_provider="openrouter",
)
response = llm.invoke("Why do parrots talk?")
print(response.content)