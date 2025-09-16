# create_hash.py
from app import auth

# Generate the hash for your password
hashed_password = auth.get_hashed_password("password123")

# Print it to the terminal so you can copy it
print(hashed_password)