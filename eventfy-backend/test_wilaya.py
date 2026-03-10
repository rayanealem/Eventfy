import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

try:
    user = supabase.table("profiles").select("id, wilaya, email").limit(5).execute()
    print("USERS:", user.data)
except Exception as e:
    print("USERS ERROR:", str(e))

try:
    events = supabase.table("events").select("id, title, wilaya").limit(5).execute()
    print("EVENTS:", events.data)
except Exception as e:
    print("EVENTS ERROR:", str(e))
