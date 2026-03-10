import os
from dotenv import load_dotenv
from supabase import create_client, Client
import jwt

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), 'eventfy-backend', '.env')
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

print("--- Testing Supabase Credentials ---")
print(f"URL: {SUPABASE_URL}")
print(f"Service Key present: {bool(SUPABASE_SERVICE_KEY)}")
print(f"JWT Secret present: {bool(SUPABASE_JWT_SECRET)}")

# 1. Test Supabase Client Connection
try:
    print("\n1. Testing Supabase Client Connection...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # Try a simple DB operation - fetching the current time is a good ping
    # Since we can't do a raw query easily, we will just try to list an arbitrary table (or handle the 404/empty gracefully if it doesn't exist, to prove auth works)
    # A cleaner way is to just call auth.get_user() or check RPC. We'll try to list users (requires service role).
    users = supabase.auth.admin.list_users()
    print("✅ Supabase service client initialized and can access admin auth APIs!")
    
except Exception as e:
    print(f"❌ Failed to connect or use service client: {e}")

# 2. Test JWT decoding
try:
    print("\n2. Testing JWT Secret Decoding (using the service key as a test token)...")
    # This is slightly hacky: we'll try to decode the service key (which is a JWT!) using the JWT_SECRET.
    # The signature should verify correctly if SUPABASE_JWT_SECRET is correct for this project.
    
    # We pass algorithms=["HS256"] and audience/issuer as needed, but for a basic check, just verifying the signature is enough.
    # Note: the service_key might have a different audience, so we use options={"verify_aud": False}
    decoded = jwt.decode(SUPABASE_SERVICE_KEY, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
    
    print("✅ JWT Secret successfully verified the token signature!")
    print(f"   Decoded Payload Role: {decoded.get('role')}")
except jwt.ExpiredSignatureError:
     print("✅ JWT Secret verified signature, but token is expired (this shouldn't happen for a service key usually, but still proves the secret is right).")
except jwt.InvalidSignatureError:
     print("❌ JWT Signature verification failed! The SUPABASE_JWT_SECRET is incorrect for this project/token.")
except Exception as e:
    print(f"❌ JWT decoding test failed: {e}")

print("\n--- Test Complete ---")
