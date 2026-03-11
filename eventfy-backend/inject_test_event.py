import os
from dotenv import load_dotenv
from supabase import create_client, Client
import datetime
import uuid
import random

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

def inject_data():
    # 1. Get an organization
    print("Fetching an existing organization...")
    orgs = supabase.table('organizations').select('id, name').limit(1).execute()
    if not orgs.data:
        print("No organization found. Please run the browser test first to create one.")
        return
    org_id = orgs.data[0]['id']
    org_name = orgs.data[0]['name']
    print(f"Using Organization: {org_name} ({org_id})")

    # 2. Get some users to register
    users = supabase.table('profiles').select('id, username').limit(50).execute()
    user_list = users.data

    # 3. Create a Live Event
    print("Creating a Live Event...")
    dt_now = datetime.datetime.now(datetime.timezone.utc)
    event_payload = {
        "org_id": org_id,
        "created_by": user_list[0]['id'],
        "title": "GLOBAL CYBER SUMMIT 2026",
        "description": "An elite gathering of net-runners and cyber-security experts.",
        "starts_at": (dt_now - datetime.timedelta(hours=1)).isoformat(), # Started 1 hour ago
        "ends_at": (dt_now + datetime.timedelta(hours=5)).isoformat(),
        "event_type": "science",
        "venue_name": "Neo-Algiers District 5 & Virtua-Link",
        "city": "Algiers",
        "wilaya": "16",
        "is_online": True,
        "cover_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000",
        "capacity": 500,
        "status": "live",
        "is_live": True
    }
    event_res = supabase.table('events').insert(event_payload).execute()
    event_id = event_res.data[0]['id']
    print(f"Created Event: {event_id}")

    # 4. Create Ticket Tier
    print("Creating Ticket Tiers...")
    ticket_payload = {
        "event_id": event_id,
        "name": "VIP PROTOCOL ACCESS",
        "price": 0, # Free for testing
        "quantity": 200
    }
    ticket_res = supabase.table('event_ticket_tiers').insert(ticket_payload).execute()
    ticket_id = ticket_res.data[0]['id']

    # 5. Create Registrations
    print(f"Registering {len(user_list)} users...")
    registrations = []
    for u in user_list:
        status = random.choice(["confirmed", "confirmed", "confirmed", "attended"]) 
        registrations.append({
            "event_id": event_id,
            "user_id": u['id'],
            "ticket_tier_id": ticket_id,
            "status": status,
            "qr_code_data": f"TEST_QR_{uuid.uuid4()}"
        })
    supabase.table('event_registrations').insert(registrations).execute()

    # 6. Update Event Registration Count
    print("Updating event registration count...")
    supabase.table('events').update({"registration_count": len(user_list)}).eq('id', event_id).execute()

    # 7. Create Some Event Posts (to test Command Center/Dashboard activity)
    print("Creating Event Posts...")
    posts = [
        {"author_id": org_id, "event_id": event_id, "content": "The gates are open. Secure your uplink and sync your credentials.", "author_type": "organization"},
        {"author_id": org_id, "event_id": event_id, "content": "Keynote speaker just arrived. Standby for main frame broadcast.", "author_type": "organization"}
    ]
    supabase.table('posts').insert(posts).execute()

    # 8. Create Scheduled Event
    print("Creating a Scheduled Event...")
    future_event = {
        "org_id": org_id,
        "created_by": user_list[0]['id'],
        "title": "NEURAL LINK HACKATHON",
        "description": "Future tech hackathon.",
        "starts_at": (dt_now + datetime.timedelta(days=7)).isoformat(),
        "ends_at": (dt_now + datetime.timedelta(days=9)).isoformat(),
        "event_type": "science",
        "venue_name": "Cybernetics Lab",
        "cover_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=2000",
        "capacity": 150,
        "status": "scheduled",
        "is_live": False
    }
    supabase.table('events').insert(future_event).execute()

    print("Data injection complete! You can now test the Dashboard, Analytics, and Command Center.")

if __name__ == "__main__":
    try:
        inject_data()
    except Exception as e:
        import json
        with open("error.json", "w") as f:
            json.dump(e.args[0] if len(e.args) > 0 else str(e), f)
