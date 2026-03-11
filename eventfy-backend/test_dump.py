import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

# List all rows in user_follows
print("=== ALL user_follows rows ===")
uf = supabase.table("user_follows").select("*").execute()
print(f"Total rows: {len(uf.data or [])}")
for r in (uf.data or []):
    print(f"  {r}")

print("\n=== ALL org_followers rows ===")
of = supabase.table("org_followers").select("*").execute()
print(f"Total rows: {len(of.data or [])}")
for r in (of.data or []):
    print(f"  {r}")

print("\n=== ALL saved_events rows ===")
se = supabase.table("saved_events").select("*").execute()
print(f"Total rows: {len(se.data or [])}")
for r in (se.data or []):
    print(f"  {r}")

print("\n=== ALL event_registrations rows ===")
er = supabase.table("event_registrations").select("*").execute()
print(f"Total rows: {len(er.data or [])}")
for r in (er.data or [])[:5]:
    print(f"  {r}")

# Test count="exact"
print("\n=== Testing count='exact' ===")
try:
    res = supabase.table("user_follows").select("follower_id", count="exact").execute()
    print(f"count attr: {res.count}")
    print(f"data len: {len(res.data or [])}")
except Exception as e:
    print(f"ERROR: {e}")
