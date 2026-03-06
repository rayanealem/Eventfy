import os
import random
import uuid
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Ensure we're in the right directory or load the right .env
env_path = os.path.join(os.path.dirname(__file__), '.env')
if not os.path.exists(env_path):
    print("Cannot find .env file. Please run from within eventfy-backend or ensure .env exists.")
    exit(1)

load_dotenv(env_path)

try:
    from supabase import create_client
except ImportError:
    print("supabase package not found. Let's install it.")
    os.system('pip install supabase')
    from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("SUPABASE_URL and SUPABASE_SERVICE_KEY must be in .env")
    exit(1)

supabase = create_client(url, key)

cities = ["Algiers", "Oran", "Constantine", "Annaba", "Setif", "Batna", "Tizi Ouzou", "Bejaia"]
shapes = ["circle", "triangle", "square", "diamond"]
colors = ["#FF2D78", "#00E5CC", "#FFD700", "#FF4D4D", "#3B82F6"]
org_types = ["university_club", "ngo", "sports_club", "company", "other"]
event_types = ["sport", "science", "charity", "cultural"]

first_names = ["Ahmed", "Amine", "Yacine", "Sara", "Meriem", "Lina", "Anis", "Karim", "Walid", "Nour", "Rania", "Aymen"]
last_names = ["Benali", "Meziane", "Bouzid", "Saadi", "Mansouri", "Haddad", "Yahia", "Kadir"]

print("1. Creating 100 Mock Users via Admin API (takes ~20 seconds)...")
print("Note: If some fail due to existing email, they are just skipped.")

for i in range(100):
    try:
        username = f"user_{random.randint(10000,99999)}_{i}"
        fn = f"{random.choice(first_names)} {random.choice(last_names)}"
        email = f"{username}@mock.eventfy.dz"
        
        # Create user via admin API
        user_res = supabase.auth.admin.create_user({
            "email": email,
            "password": "password123",
            "email_confirm": True,
            "user_metadata": {
                "username": username,
                "full_name": fn
            }
        })
        
        # We don't strictly need to capture the ID immediately because we'll just fetch ALL profiles next
        # But this guarantees they exist in auth.users and the trigger populated public.profiles
        
        if (i+1) % 20 == 0:
            print(f"   Created {i+1}/100 users...")
    except Exception as e:
        # Ignore errors (probably email already exists if ran multiple times)
        pass

# Fetch all users (includes our new ones plus any manual ones you made before)
print("Fetching all users from database to use for mock data...")
res = supabase.table('profiles').select('id').execute()
user_ids = [p['id'] for p in res.data]

print(f"Total available users for mock data: {len(user_ids)}")

if not user_ids:
    print("No users found. Cannot proceed.")
    exit(1)

# Let's enrich randomly some profiles just so they have cities/xp
print("Enriching profile shapes, cities, xp...")
for chunk in [user_ids[x:x+50] for x in range(0, len(user_ids), 50)]:
    for uid in chunk:
        supabase.table('profiles').update({
            "bio": f"Hello from {random.choice(cities)}!",
            "wilaya": random.choice(cities),
            "city": random.choice(cities),
            "shape": random.choice(shapes),
            "shape_color": random.choice(colors),
            "is_student": random.choice([True, False]),
            "role": "participant",
            "xp": random.randint(0, 15000),
            "level": random.randint(1, 15),
            "onboarding_done": True
        }).eq("id", uid).execute()


print("2. Creating 50 Organizations...")
orgs_to_insert = []
for i in range(50):
    name = f"Organization {i} {random.choice(last_names)}"
    slug = f"org-mock-{random.randint(10000,99999)}-{i}"
    otype = random.choice(org_types)
    city = random.choice(cities)
    orgs_to_insert.append({
        "owner_id": random.choice(user_ids),
        "name": name,
        "slug": slug,
        "org_type": otype,
        "official_email": f"contact@{slug}.dz",
        "description": f"We are {name}, a great {otype} based in {city}.",
        "status": "approved",
        "verified": True,
        "follower_count": random.randint(10, 500),
        "wilaya": city,
        "city": city
    })

# Batch insert orgs
res = supabase.table('organizations').insert(orgs_to_insert).execute()
org_ids = [o['id'] for o in res.data]
print(f"   Created {len(org_ids)} orgs.")

print("3. Creating 300 Events...")
events_to_insert = []
now = datetime.now()
for i in range(300):
    days_offset = random.randint(-30, 60)
    start = now + timedelta(days=days_offset)
    end = start + timedelta(hours=random.randint(2, 48))
    status = 'completed' if end < now else ('live' if start <= now <= end else 'scheduled')
    city = random.choice(cities)
    
    events_to_insert.append({
        "org_id": random.choice(org_ids),
        "created_by": random.choice(user_ids),
        "title": f"Massive Event {i}: {random.choice(['Hackathon', 'Tournament', 'Conference', 'Meetup'])}",
        "slug": f"event-mock-{random.randint(10000,99999)}-{i}",
        "event_type": random.choice(event_types),
        "status": status,
        "starts_at": start.isoformat(),
        "ends_at": end.isoformat(),
        "wilaya": city,
        "city": city,
        "capacity": random.randint(50, 1000),
        "xp_checkin": random.randint(100, 500),
        "is_paid": False
    })

event_ids = []
for i in range(0, 300, 100):
    res = supabase.table('events').insert(events_to_insert[i:i+100]).execute()
    event_ids.extend([e['id'] for e in res.data])
print(f"   Created {len(event_ids)} events.")


print("4. Creating 5,000 Registrations...")
regs_to_insert = []
# Ensure we don't have dupes in (event_id, user_id)
for eid in event_ids:
    num_regs = random.randint(5, 30)
    reg_users = random.sample(user_ids, min(num_regs, len(user_ids)))
    for u in reg_users:
        status = random.choice(['confirmed', 'pending_approval'])
        checked_in = True if status == 'confirmed' and random.random() > 0.5 else False
        regs_to_insert.append({
            "event_id": eid,
            "user_id": u,
            "status": status,
            "checked_in": checked_in
        })

# batch insert registrations
for i in range(0, len(regs_to_insert), 500):
    try:
        supabase.table('event_registrations').insert(regs_to_insert[i:i+500]).execute()
    except Exception as e:
        print(f"Ignoring duplicate reg error: {e}")
print(f"   Processed {len(regs_to_insert)} registrations.")


print("5. Creating 500 Posts...")
posts_to_insert = []
for i in range(500):
    posts_to_insert.append({
        "author_id": random.choice(user_ids),
        "content": f"Amazing post about {random.choice(event_types)} in {random.choice(cities)}! Loving Eventfy #eventfy #{random.choice(last_names)}",
        "like_count": random.randint(0, 200),
        "comment_count": random.randint(0, 50)
    })
for i in range(0, 500, 50):
    supabase.table('posts').insert(posts_to_insert[i:i+50]).execute()
print("   Created 500 posts.")

print("\n✅ MASSIVE MOCK DATA SUCCESSFULLY INSERTED DIRECTLY VIA API!")
