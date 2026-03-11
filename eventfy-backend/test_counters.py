import os
import traceback
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

user_res = supabase.table("profiles").select("*").limit(1).execute()
user = user_res.data[0]

# Try to update following_count
try:
    print("updating profile following_count...")
    supabase.table("profiles").update({
        "following_count": (user.get("following_count") or 0) + 1,
    }).eq("id", user["id"]).execute()
    print("success")
except Exception as e:
    traceback.print_exc()

org_res = supabase.table("organizations").select("*").limit(1).execute()
org = org_res.data[0]
try:
    print("updating org follower_count...")
    supabase.table("organizations").update({
        "follower_count": (org.get("follower_count") or 0) + 1,
    }).eq("id", org["id"]).execute()
    print("success")
except Exception as e:
    traceback.print_exc()
