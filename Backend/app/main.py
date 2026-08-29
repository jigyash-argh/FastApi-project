from fastapi import FastAPI
from app.db.database import database
app=FastAPI()
@app.get("/")
def root():
    return {
        "message":"fastapi is running"
    }
@app.get("/health")
async def check_health():
    await database.command("ping")
    return{
        "statues":"ok",
        "database":"connected"
    }