import os
import sys

sys.path.insert(0, os.path.abspath(r"d:\Eventfy-fig\eventfy-backend"))
from middleware.auth import get_current_user
import asyncio

# A hardcoded token from the frontend. We can't get it easily without a browser.
# Wait, let's just test if the update query itself is failing because of RLS.

from config import supabase
res = supabase.table("events").update({"like_count": 5}).eq("id", "9e82cedf-dcd3-4a4c-95fc-5b450f945ef7").execute()
print("Direct update response:", res.data)
