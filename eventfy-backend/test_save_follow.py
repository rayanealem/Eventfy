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

org_res = supabase.table("organizations").select("id").limit(1).execute()
org_id = org_res.data[0]["id"]

API_URL = "http://127.0.0.1:8005/v1"
headers = {"Authorization": f"Bearer {token}"}

print(f"=== Saving event {event_id} ===")
r1 = requests.post(f"{API_URL}/events/{event_id}/save", headers=headers, timeout=15)
print(f"SAVE RESPONSE: {r1.status_code}")
print(r1.text[:2000])
print()

print(f"=== Following org {org_id} ===")
r2 = requests.post(f"{API_URL}/orgs/{org_id}/follow", headers=headers, timeout=15)
print(f"FOLLOW ORG RESPONSE: {r2.status_code}")
print(r2.text[:2000])
print()

user_res = supabase.table("profiles").select("id").neq("id", res.user.id).limit(1).execute()
if user_res.data:
    target_user_id = user_res.data[0]["id"]
    print(f"=== Following user {target_user_id} ===")
    r3 = requests.post(f"{API_URL}/users/follow/{target_user_id}", headers=headers, timeout=15)
    print(f"FOLLOW USER RESPONSE: {r3.status_code}")
    print(r3.text[:2000])
