import os
from dotenv import load_dotenv
from supabase import create_client, Client

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

if not SUPABASE_URL:
    print("WARNING: SUPABASE_URL not set in .env. DB operations will fail.")
if not SUPABASE_SERVICE_KEY:
    print("WARNING: SUPABASE_SERVICE_KEY not set in .env. DB operations will fail.")
if not JWT_SECRET:
    print("WARNING: SUPABASE_JWT_SECRET not set in .env. Auth operations will fail.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_KEY else None
