import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

for table in ["event_likes", "event_comments"]:
    print(f"\n=== {table} ===")
    for col in ["id", "event_id", "user_id", "created_at", "content"]:
        try:
            supabase.table(table).select(col).limit(0).execute()
            print(f"  '{col}': EXISTS")
        except Exception as e:
            if "does not exist" in str(e):
                print(f"  '{col}': MISSING")
            else:
                print(f"  '{col}': ERROR - {str(e)[:80]}")
