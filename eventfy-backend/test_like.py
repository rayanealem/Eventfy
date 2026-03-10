import os
import sys

# Add backend dir to python path
sys.path.insert(0, os.path.abspath(r"d:\Eventfy-fig\eventfy-backend"))
from config import supabase

print("Testing Supabase connection...")
try:
    res = supabase.table("events").select("id, like_count, comment_count").limit(1).execute()
    print("Found event:", res.data)
    if res.data:
        event_id = res.data[0]["id"]
        print(f"Testing fake update on {event_id}...")
        
        # Test the update query exact logic
        update_res = supabase.table("events").update({
            "like_count": 999
        }).eq("id", event_id).execute()
        
        print("Update response:", update_res.data)
except Exception as e:
    print("Error:", e)
