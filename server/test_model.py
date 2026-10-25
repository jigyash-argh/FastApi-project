
import os
import time
import logging

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

logging.basicConfig(level=logging.INFO)

def main():
    print("\n========== OPENROUTER MODEL TEST ==========\n")

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        print("ERROR: OPENROUTER_API_KEY was not found.")
        print("Check your .env file and its location.")
        return

    print("API key found:", api_key[:8] + "...")
    print("Initializing model...")

    try:
        model = init_chat_model(
                    "openrouter/free",
                    model_provider="openrouter",
                    temperature=0.7,
                    max_tokens=300,
                    timeout=120000,
                    max_retries=0,
                )

        messages = [
            SystemMessage(
                content="You are a helpful assistant. Keep responses concise."
            ),
            HumanMessage(
                content="Reply with exactly: OpenRouter is working!"
            ),
        ]

        print("Model initialized.")
        print("Sending prompt to OpenRouter...")
        start = time.perf_counter()

        response = model.invoke(messages)

        elapsed = time.perf_counter() - start

        print("\n========== SUCCESS ==========")
        print(f"Response time: {elapsed:.2f} seconds")
        print("Response:")
        print(response.content)
        print("\nModel metadata:")
        print(response.response_metadata)

    except Exception as exc:
        elapsed = time.perf_counter() - start if "start" in locals() else 0

        print("\n========== FAILED ==========")
        print(f"Elapsed time: {elapsed:.2f} seconds")
        print("Exception type:", type(exc).__name__)
        print("Exception message:", str(exc))
        logging.exception("Model test failed")

if __name__ == "__main__":
    main()
