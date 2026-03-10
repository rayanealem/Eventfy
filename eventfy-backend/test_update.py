import os
import requests
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
API_URL = "http://127.0.0.1:8005/v1"
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

print("1. Logging in...")

try:
    res = supabase.auth.sign_in_with_password({"email": "test@eventfy.dz", "password": "password123"})
    token = res.session.access_token
except Exception as e:
    print("Login failed, registering via supabase...", e)
    res = supabase.auth.sign_up({"email": "test@eventfy.dz", "password": "password123"})
    if res.session:
        token = res.session.access_token
    else:
        print("No session after register")
        token = None


# 2. Get an event
res = requests.get(f"{API_URL}/events")
events = res.json().get("events", [])
if not events:
    print("No events found.")
    exit(1)

event_id = events[0]["id"]
print(f"Target event: {event_id}")

# 3. Like event
headers = {"Authorization": f"Bearer {token}"}
res = requests.post(f"{API_URL}/events/{event_id}/like", headers=headers)
print("LIKE response:", res.status_code, res.text)

# 4. Save event
res = requests.post(f"{API_URL}/events/{event_id}/save", headers=headers)
print("SAVE response:", res.status_code, res.text)

# 5. Comment event
res = requests.post(f"{API_URL}/events/{event_id}/comment", json={"content": "test comment"}, headers=headers)
print("COMMENT response:", res.status_code, res.text)
