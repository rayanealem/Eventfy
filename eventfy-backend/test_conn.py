"""Quick test to verify Supabase connection."""
import os
import traceback
from dotenv import load_dotenv

load_dotenv()

try:
    from supabase import create_client
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    print(f"URL: {url}")
    print(f"Key length: {len(key) if key else 0}")
    
    client = create_client(url, key)
    print("Client created successfully")
    
    # Try a simple query
    result = client.table("profiles").select("id").limit(1).execute()
    print(f"Profiles query: {result.data}")
    print("SUCCESS: Connected to Supabase!")
except Exception as e:
    traceback.print_exc()
    print(f"\nError: {e}")
