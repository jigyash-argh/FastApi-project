# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Your existing settings
    DATABASE_URL: str = "mongodb://localhost:27017"
    SECRET_KEY: str = "your_super_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    OPENROUTER_API_KEY: str
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"
        
        # Optional: Add this if you want to be able to
        # use settings.openrouter_api_key (lowercase)
        # in your code. It's good practice.
        # extra = 'allow' # Or you can just be explicit like we did above.

settings = Settings()