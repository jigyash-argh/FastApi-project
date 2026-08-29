from app.core.config import settings
from pymongo import AsyncMongoClient
client=AsyncMongoClient(settings.MONGO_URI)
database=client[settings.MONGO_DB]