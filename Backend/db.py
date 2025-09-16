# app/db.py

# ❌ DO NOT import auth here. Remove the line: from . import auth

# This dictionary acts as our database
DUMMY_USERS_DB = {
    "jigyash": {
        "username": "jigyash",
        # ✅ Paste the pre-computed hash string directly
        "hashed_pass": "$2b$12$Eix2s9y3a8g.p4z2B6e8UuGoJ5DPfV6j8t.d7u8S2q9W4c.a3b5C6", # Replace with YOUR hash
        "email": "shuklajigyash3@gmail.com",
        "full_name": "Jigyash Shukla",
    }
}

def get_user(username: str):
    """A function to retrieve a user from the 'database'."""
    if username in DUMMY_USERS_DB:
        return DUMMY_USERS_DB[username]
    return None