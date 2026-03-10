import os
from dotenv import load_dotenv
import requests
from jose import jwt
from supabase import create_client

load_dotenv()

# Get a valid user ID from the database
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)
user_res = supabase.table("profiles").select("id").limit(1).execute()
user_id = user_res.data[0]["id"]
print("Using user_id:", user_id)

# Sign token using HS256 and JWT_SECRET
jwt_secret = os.getenv("JWT_SECRET")
token = jwt.encode({"sub": user_id, "role": "authenticated"}, jwt_secret, algorithm="HS256")

# Fetch feed
API_URL = "http://127.0.0.1:8005/v1"
headers = {"Authorization": f"Bearer {token}"}
print(f"Fetching feed AS AUTHENTICATED USER ({user_id})...")
res = requests.get(f"{API_URL}/events/feed?scope=local&page=1&limit=5", headers=headers)

print("Status:", res.status_code)
try:
    data = res.json()
    events = data.get("events", [])
    print(f"Found {len(events)} events.")
    if len(events) == 0:
        print("Data:", data)
except Exception as e:
    print("Failed to parse JSON:", res.text)
