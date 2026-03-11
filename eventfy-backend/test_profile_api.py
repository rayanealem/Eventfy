import os, requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

email = "temp_test_like@eventfy.app"
password = "TestPassword123!"
try:
    supabase.auth.sign_up({"email": email, "password": password, "options": {"data": {"username": "temptest", "full_name": "Temp Test"}}})
except: pass

res = supabase.auth.sign_in_with_password({"email": email, "password": password})
token = res.session.access_token
uid = res.user.id

API = "http://127.0.0.1:8005/v1"
headers = {"Authorization": f"Bearer {token}"}

# Test /auth/me
print("=== GET /auth/me ===")
r = requests.get(f"{API}/auth/me", headers=headers, timeout=10)
data = r.json()
print(f"Status: {r.status_code}")
print(f"follower_count: {data.get('follower_count')}")
print(f"following_count: {data.get('following_count')}")
print(f"event_count: {data.get('event_count')}")

# Check actual DB counts
print("\n=== DB counts ===")
uf = supabase.table("user_follows").select("*").eq("follower_id", uid).execute()
print(f"user_follows (I follow): {len(uf.data or [])}")
uf2 = supabase.table("user_follows").select("*").eq("following_id", uid).execute()
print(f"user_follows (follow me): {len(uf2.data or [])}")
of = supabase.table("org_followers").select("*").eq("user_id", uid).execute()
print(f"org_followers (I follow orgs): {len(of.data or [])}")
er = supabase.table("event_registrations").select("*").eq("user_id", uid).execute()
print(f"event_registrations: {len(er.data or [])}")
se = supabase.table("saved_events").select("*").eq("user_id", uid).execute()
print(f"saved_events: {len(se.data or [])}")

# Now test with the REAL user (first profile)
print("\n=== Checking main user ===")
profiles = supabase.table("profiles").select("id, username").limit(5).execute()
for p in profiles.data:
    pid = p["id"]
    uf = supabase.table("user_follows").select("*").eq("follower_id", pid).execute()
    uf2 = supabase.table("user_follows").select("*").eq("following_id", pid).execute()
    of = supabase.table("org_followers").select("*").eq("user_id", pid).execute()
    print(f"  {p['username']}: user_following={len(uf.data)}, user_followers={len(uf2.data)}, org_follows={len(of.data)}")
