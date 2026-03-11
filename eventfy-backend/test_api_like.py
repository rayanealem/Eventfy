import os
from dotenv import load_dotenv
import requests
from jose import jwt
from supabase import create_client

load_dotenv()

# Get a valid user ID and event ID from the database
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)
user_res = supabase.table("profiles").select("id").limit(1).execute()
user_id = user_res.data[0]["id"]
print("Using user_id:", user_id)

event_res = supabase.table("events").select("id").limit(1).execute()
event_id = event_res.data[0]["id"]
print("Using event_id:", event_id)

# Sign token using HS256 and JWT_SECRET
jwt_secret = os.getenv("JWT_SECRET")
token = jwt.encode({"sub": user_id, "role": "authenticated"}, jwt_secret, algorithm="HS256")

# Test Liking an Event
API_URL = "http://127.0.0.1:8005/v1"
headers = {"Authorization": f"Bearer {token}"}
print(f"Liking event... {event_id}")
res = requests.post(f"{API_URL}/events/{event_id}/like", headers=headers)

if res.status_code == 200:
    print("SUCCESS")
else:
    print("STATUS:", res.status_code)
    print("ERROR:", res.text)
