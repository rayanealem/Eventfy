import os
import time
from supabase import create_client
from dotenv import load_dotenv
import requests

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZnZnbGN1ZXd1c2xwZHRha3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODAzNTMsImV4cCI6MjA4ODI1NjM1M30.rzWltu_HUnJtzU0ZwHrGWmtwxenZ707MJ7feLPDK8mA"
anon_supabase = create_client(os.getenv("SUPABASE_URL"), anon_key)

email = f"test_{int(time.time())}@example.com"
password = "TestPassword123!"

print(f"Signing up as {email}...")
res = supabase.auth.admin.create_user({"email": email, "password": password, "email_confirm": True})

print("Logging in...")
auth_res = anon_supabase.auth.sign_in_with_password({"email": email, "password": password})
access_token = auth_res.session.access_token

API_URL = "http://127.0.0.1:8005/v1"
headers = {"Authorization": f"Bearer {access_token}"}
print("Fetching feed AS AUTHENTICATED USER...")
resp = requests.get(f"{API_URL}/events/feed?scope=local&page=1&limit=5", headers=headers)

print("Status:", resp.status_code)
try:
    data = resp.json()
    events = data.get("events", [])
    print(f"Found {len(events)} events.")
    print("Response keys:", list(data.keys()))
except Exception as e:
    print("Failed to parse JSON:", resp.text)
