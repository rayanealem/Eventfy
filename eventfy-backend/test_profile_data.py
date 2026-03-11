import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

# Check what tables exist for events
for table in ["event_registrations", "event_attendees"]:
    try:
        res = supabase.table(table).select("*").limit(0).execute()
        print(f"Table '{table}': EXISTS")
    except Exception as e:
        if "does not exist" in str(e) or "relation" in str(e):
            print(f"Table '{table}': DOES NOT EXIST")
        else:
            print(f"Table '{table}': ERROR - {str(e)[:100]}")

# Check profiles columns
p = supabase.table("profiles").select("*").limit(1).execute()
if p.data:
    print("\nProfile columns:", list(p.data[0].keys()))
    print("follower_count:", p.data[0].get("follower_count"))
    print("following_count:", p.data[0].get("following_count"))
    print("event_count:", p.data[0].get("event_count"))
    print("events_attended:", p.data[0].get("events_attended"))

# Check actual follow counts
user_id = p.data[0]["id"]
followers = supabase.table("user_follows").select("follower_id").eq("following_id", user_id).execute()
following = supabase.table("user_follows").select("following_id").eq("follower_id", user_id).execute()
print(f"\nActual followers for {user_id}: {len(followers.data or [])}")
print(f"Actual following for {user_id}: {len(following.data or [])}")
