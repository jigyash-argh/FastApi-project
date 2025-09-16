# app/config.py
from pydantic_settings import BaseSettings

# This is our single source of truth for all environment variables.
class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30   

    class Config:
        env_file = ".env"

# Create a single instance of the settings to be used throughout the app
settings = Settings()