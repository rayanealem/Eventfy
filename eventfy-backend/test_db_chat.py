import asyncio
from config import supabase

async def test():
    try:
        channel_id = "testing" # just see if the schema complains
        msgs = supabase.table("messages").select("*, profiles(username, full_name, avatar_url, shape, shape_color)").eq("channel_id", channel_id).is_("deleted_at", "null").order("created_at", desc=False).limit(50).execute()
        print("Messages:", msgs)
    except Exception as e:
        print("ERROR:", repr(e))

asyncio.run(test())
