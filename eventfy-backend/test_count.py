import os, requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

# Get a user who has follows
uf = supabase.table("user_follows").select("*").limit(1).execute()
if uf.data:
    uid = uf.data[0]["follower_id"]
    print(f"Testing with user: {uid}")
    
    # Method 1: count="exact" with filter
    res1 = supabase.table("user_follows").select("follower_id", count="exact").eq("follower_id", uid).execute()
    print(f"  count='exact' .count: {res1.count}")
    print(f"  count='exact' len(data): {len(res1.data or [])}")
    
    # Method 2: just select and len
    res2 = supabase.table("user_follows").select("follower_id").eq("follower_id", uid).execute()
    print(f"  no count, len(data): {len(res2.data or [])}")
    
    # Who is this user?
    p = supabase.table("profiles").select("username").eq("id", uid).single().execute()
    print(f"  username: {p.data.get('username') if p.data else 'unknown'}")
else:
    print("No user_follows rows found")

# Now test with the live API endpoint
print("\nTesting /auth/me with test user...")
email = "temp_test_like@eventfy.app"
password = "TestPassword123!"
res = supabase.auth.sign_in_with_password({"email": email, "password": password})
token = res.session.access_token

r = requests.get("http://127.0.0.1:8005/v1/auth/me", 
                  headers={"Authorization": f"Bearer {token}"}, timeout=10)
d = r.json()
print(f"  follower_count: {d.get('follower_count')}")
print(f"  following_count: {d.get('following_count')}")
print(f"  event_count: {d.get('event_count')}")
