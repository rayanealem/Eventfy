import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

# Check table columns
for table in ["saved_events", "user_follows", "org_followers"]:
    print(f"\n=== {table} columns ===")
    try:
        res = supabase.rpc("", {}).execute()
    except:
        pass
    
    # Just try to select * with limit 0 to see what columns exist
    try:
        res = supabase.table(table).select("*").limit(0).execute()
        print(f"  Table exists, query succeeded")
    except Exception as e:
        print(f"  ERROR: {e}")
    
    # Try selecting specific columns
    for col in ["id", "user_id", "event_id", "follower_id", "following_id", "org_id", "created_at"]:
        try:
            res = supabase.table(table).select(col).limit(0).execute()
            print(f"  Column '{col}': EXISTS")
        except Exception as e:
            err_str = str(e)
            if "does not exist" in err_str:
                print(f"  Column '{col}': MISSING")
            else:
                print(f"  Column '{col}': ERROR - {err_str[:100]}")
