from bson import ObjectId

from app.db.database import get_database
def get_user_by_email(email:str):
    db=get_database()
    user=db.users.find_one({"email": email})
    return user

def create_user(user_data:dict):
    db=get_database()
    result=db.users.insert_one(user_data)
    return str(result.inserted_id)

def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        return None
    
    db = get_database()
    return db.users.find_one({"_id": ObjectId(user_id)})