import os
from dotenv import load_dotenv
from supabase import create_client, Client
import random
import datetime

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

def seed():
    print("Fetching events...")
    events = supabase.table('events').select('id, title').limit(2).execute()
    if not events.data:
        print("No events found. Exiting.")
        return

    for event in events.data:
        event_id = event['id']
        print(f"Seeding chat for event: {event['title']}")
        
        # Get registered users
        regs = supabase.table('event_registrations').select('user_id').eq('event_id', event_id).execute()
        user_ids = [r['user_id'] for r in regs.data]
        if not user_ids:
            print("  No registered users. Skipping.")
            continue

        # Get or create channels
        channels = supabase.table('chat_channels').select('*').eq('event_id', event_id).execute()
        if not channels.data:
            print("  Creating default channels...")
            supabase.table('chat_channels').insert([
                {"event_id": event_id, "name": "general", "channel_type": "event"},
                {"event_id": event_id, "name": "announcements", "channel_type": "event", "is_locked": True}
            ]).execute()
            channels = supabase.table('chat_channels').select('*').eq('event_id', event_id).execute()
        
        general_chan = next((c for c in channels.data if c['name'] == 'general'), None)
        if general_chan and len(user_ids) > 0:
            print(f"  Injecting messages into {general_chan['name']}...")
            messages = [
                "Hey everyone! So excited for this event.",
                "Does anyone know if there's parking nearby?",
                "Yes, there is a lot right across the street.",
                "Awesome, thanks!",
                "Can't wait for the keynote.",
                "Is the schedule out yet?",
                "Check the main event page for the schedule.",
                "Hello world from the chat!",
                "Anyone want to grab coffee before it starts?"
            ]
            dt_now = datetime.datetime.utcnow()
            payloads = []
            for i, txt in enumerate(messages):
                sender = random.choice(user_ids)
                created = (dt_now - datetime.timedelta(minutes=50 - i*5)).isoformat()
                payloads.append({
                    "channel_id": general_chan['id'],
                    "sender_id": sender,
                    "content": txt,
                    "msg_type": "text",
                    "created_at": created
                })
            supabase.table('messages').insert(payloads).execute()

    # Create a DM
    users = supabase.table('profiles').select('id, username').limit(5).execute()
    if len(users.data) >= 2:
        u1, u2 = users.data[0], users.data[1]
        print(f"Creating DM between {u1['username']} and {u2['username']}...")
        name1 = f"{u1['id']}:{u2['id']}"
        name2 = f"{u2['id']}:{u1['id']}"
        existing = supabase.table('chat_channels').select('*').in_('name', [name1, name2]).execute()
        if not existing.data:
            chan = supabase.table('chat_channels').insert({"name": name1, "channel_type": "dm"}).execute()
            c_id = chan.data[0]['id']
            print("  Injecting DM messages...")
            dt_now = datetime.datetime.utcnow()
            supabase.table('messages').insert([
                {"channel_id": c_id, "sender_id": u1['id'], "content": "Hey, going to the event?", "created_at": (dt_now - datetime.timedelta(minutes=10)).isoformat()},
                {"channel_id": c_id, "sender_id": u2['id'], "content": "Yeah! See you there.", "created_at": (dt_now - datetime.timedelta(minutes=5)).isoformat()},
            ]).execute()

    print("Seeding complete.")

if __name__ == '__main__':
    seed()
