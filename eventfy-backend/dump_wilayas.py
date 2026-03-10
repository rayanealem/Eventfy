import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

users = supabase.table("profiles").select("id, email, wilaya").execute()
print("USERS:")
for u in users.data:
    print(f" - {u.get('email', u['id'][:8])}: wilaya={u.get('wilaya')}")

events = supabase.table("events").select("id, title, wilaya").execute()
print("\nEVENTS:")
for e in events.data:
    print(f" - {e['title'][:20]}: wilaya={e.get('wilaya')}")
