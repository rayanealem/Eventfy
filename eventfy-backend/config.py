import os
from dotenv import load_dotenv
from supabase import create_client, Client

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

SUPABASE_URL: str = "https://cdfvglcuewuslpdtakyd.supabase.co"
SUPABASE_SERVICE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZnZnbGN1ZXd1c2xwZHRha3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODAzNTMsImV4cCI6MjA4ODI1NjM1M30.rzWltu_HUnJtzU0ZwHrGWmtwxenZ707MJ7feLPDK8mA"
JWT_SECRET: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZnZnbGN1ZXd1c2xwZHRha3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODAzNTMsImV4cCI6MjA4ODI1NjM1M30.rzWltu_HUnJtzU0ZwHrGWmtwxenZ707MJ7feLPDK8mA"

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("WARNING: SUPABASE_URL or SUPABASE_SERVICE_KEY not set. DB operations will fail.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_KEY else None
