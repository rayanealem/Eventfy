import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

try:
    res = supabase.table("events").select("id, like_count").limit(1).execute()
    print("SUCCESS")
    print(res.data)
except Exception as e:
    print("ERROR:", str(e))

try:
    res2 = supabase.table("event_likes").select("*").limit(1).execute()
    print("EVENT_LIKES TABLE OK")
except Exception as e:
    print("EVENT_LIKES ERROR:", str(e))

try:
    res3 = supabase.table("event_comments").select("*").limit(1).execute()
    print("EVENT_COMMENTS TABLE OK")
except Exception as e:
    print("EVENT_COMMENTS ERROR:", str(e))
