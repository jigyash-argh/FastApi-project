from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_DB: str

    model_config = SettingsConfigDict(
        env_file=".env"
    )


settings = Settings()