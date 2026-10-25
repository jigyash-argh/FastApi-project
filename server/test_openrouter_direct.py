
import os
import time
import httpx
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise RuntimeError("OPENROUTER_API_KEY is missing")

payload = {
    "model": "nvidia/nemotron-3.5-lightning:free",
    "messages": [
        {
            "role": "user",
            "content": "Reply with exactly: Hello"
        }
    ],
    "max_tokens": 300,
    "stream": False,
}

start = time.perf_counter()

try:
    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json=payload,
        timeout=httpx.Timeout(30, connect=10),
    )

    print("Elapsed:", round(time.perf_counter() - start, 2), "seconds")
    print("Status:", response.status_code)
    response.raise_for_status()

    result = response.json()
    choice = result["choices"][0]
    message = choice["message"]

    print("Model:", result.get("model"))
    print("Finish reason:", choice.get("finish_reason"))
    print("Content:", repr(message.get("content")))
    print("Reasoning present:", bool(message.get("reasoning")))

except Exception as exc:
    print(type(exc).__name__, str(exc))
