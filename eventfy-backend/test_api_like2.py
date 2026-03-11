import requests
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

email = "temp_test_like@eventfy.app"
password = "TestPassword123!"
try:
    res = supabase.auth.sign_up({"email": email, "password": password, "options": {"data": {"username": "temptest", "full_name": "Temp Test"}}})
except Exception:
    pass

res = supabase.auth.sign_in_with_password({"email": email, "password": password})
token = res.session.access_token

event_res = supabase.table("events").select("id").limit(1).execute()
event_id = event_res.data[0]["id"]

API_URL = "http://127.0.0.1:8005/v1"
headers = {"Authorization": f"Bearer {token}"}
print(f"Liking event {event_id}...")
r = requests.post(f"{API_URL}/events/{event_id}/like", headers=headers)
print("LIKE RESPONSE:", r.status_code, r.text)

r2 = requests.post(f"{API_URL}/events/{event_id}/like", headers=headers)
print("SECOND LIKE (Duplicate) RESPONSE:", r2.status_code, r2.text)

r3 = requests.delete(f"{API_URL}/events/{event_id}/like", headers=headers)
print("UNLIKE RESPONSE:", r3.status_code, r3.text)
