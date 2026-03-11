from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

org = supabase.table("organizations").select("follower_count").limit(1).execute()
print("ORG:", org.data)

event = supabase.table("events").select("like_count, comment_count").limit(1).execute()
print("EVENT:", event.data)
