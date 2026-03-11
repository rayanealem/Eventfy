import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

user_res = supabase.table("profiles").select("id").limit(1).execute()
user_id = user_res.data[0]["id"]

event_res = supabase.table("events").select("id").limit(1).execute()
event_id = event_res.data[0]["id"]

print(f"Trying to save event {event_id} for user {user_id}")
try:
    supabase.table("saved_events").insert({
        "user_id": user_id,
        "event_id": event_id,
    }).execute()
    print("SAVED EVENT!")
except Exception as e:
    import traceback
    traceback.print_exc()

print("Trying user follows...")
user2_res = supabase.table("profiles").select("id").neq("id", user_id).limit(1).execute()
if user2_res.data:
    target_id = user2_res.data[0]["id"]
    try:
        supabase.table("user_follows").insert({
            "follower_id": user_id,
            "following_id": target_id,
        }).execute()
        print("FOLLOWED USER!")
    except Exception as e:
        import traceback
        traceback.print_exc()
