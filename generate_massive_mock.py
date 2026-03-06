import uuid
import random
from datetime import datetime, timedelta

def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def generate():
    cities = ["Algiers", "Oran", "Constantine", "Annaba", "Setif", "Batna", "Tizi Ouzou", "Bejaia"]
    shapes = ["circle", "triangle", "square", "diamond"]
    colors = ["#FF2D78", "#00E5CC", "#FFD700", "#FF4D4D", "#3B82F6"]
    org_types = ["university_club", "ngo", "sports_club", "company", "other"]
    event_types = ["sport", "science", "charity", "cultural"]
    
    first_names = ["Ahmed", "Amine", "Yacine", "Sara", "Meriem", "Lina", "Anis", "Karim", "Walid", "Nour", "Rania", "Aymen"]
    last_names = ["Benali", "Meziane", "Bouzid", "Saadi", "Mansouri", "Haddad", "Yahia", "Kadir"]

    # Generate 1000 Users
    print("Generating users...")
    users = []
    auth_inserts = []
    user_inserts = []
    for i in range(1000):
        uid = str(uuid.uuid4())
        users.append(uid)
        username = f"user_{i}_{random.randint(1000,9999)}"
        fn = f"{random.choice(first_names)} {random.choice(last_names)}"
        bio = f"Hello I am {fn} from {random.choice(cities)}!"
        city = random.choice(cities)
        shape = random.choice(shapes)
        color = random.choice(colors)
        is_student = random.choice(["TRUE", "FALSE"])
        xp = random.randint(0, 15000)
        lvl = (xp // 1000) + 1
        
        email = f"{username}@example.com"
        
        raw_user_meta = f'{{"full_name":"{fn}","username":"{username}"}}'
        
        # auth.users
        auth_inserts.append(f"({esc(uid)}, 'authenticated', 'authenticated', {esc(email)}, crypt('password123', gen_salt('bf')), NOW(), '{{\"provider\":\"email\",\"providers\":[\"email\"]}}'::jsonb, {esc(raw_user_meta)}::jsonb, NOW(), NOW())")
        
        # public.profiles
        user_inserts.append(f"({esc(uid)}, {esc(username)}, {esc(fn)}, {esc(bio)}, {esc(city)}, {esc(city)}, {esc(shape)}, {esc(color)}, {is_student}, 'participant', {xp}, {lvl}, TRUE)")

    with open("05_massive_mock_data_0_auth.sql", "w", encoding="utf-8") as out:
        out.write("-- AUTH USERS (1000)\n")
        out.write("CREATE EXTENSION IF NOT EXISTS pgcrypto;\n\n")
        batch_size = 50
        for i in range(0, len(auth_inserts), batch_size):
            batch = auth_inserts[i:i+batch_size]
            out.write("INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)\nVALUES\n")
            out.write(",\n".join(batch) + "\nON CONFLICT (id) DO NOTHING;\n\n")

    with open("05_massive_mock_data_1_profiles.sql", "w", encoding="utf-8") as out:
        out.write("-- PROFILES (1000)\n")
        batch_size = 50
        for i in range(0, len(user_inserts), batch_size):
            batch = user_inserts[i:i+batch_size]
            out.write("INSERT INTO public.profiles (id, username, full_name, bio, wilaya, city, shape, shape_color, is_student, role, xp, level, onboarding_done)\nVALUES\n")
            out.write(",\n".join(batch) + "\nON CONFLICT (id) DO UPDATE SET \\\n"
                      "bio = EXCLUDED.bio, wilaya = EXCLUDED.wilaya, city = EXCLUDED.city, \\\n"
                      "shape = EXCLUDED.shape, shape_color = EXCLUDED.shape_color, \\\n"
                      "is_student = EXCLUDED.is_student, role = EXCLUDED.role, \\\n"
                      "xp = EXCLUDED.xp, level = EXCLUDED.level, onboarding_done = EXCLUDED.onboarding_done;\n\n")

    # Generate 50 Orgs
    print("Generating Orgs...")
    orgs = []
    org_inserts = []
    for i in range(50):
        oid = str(uuid.uuid4())
        orgs.append(oid)
        owner = random.choice(users)
        name = f"Organization {i} {random.choice(last_names)}"
        slug = f"org-{i}-{random.randint(1000,9999)}"
        otype = random.choice(org_types)
        email = f"contact@{slug}.dz"
        desc = f"We are {name}, a great {otype} based in {random.choice(cities)}."
        city = random.choice(cities)
        fcount = random.randint(10, 500)
        
        org_inserts.append(f"({esc(oid)}, {esc(owner)}, {esc(name)}, {esc(slug)}, {esc(otype)}, {esc(email)}, {esc(desc)}, 'approved', TRUE, {fcount}, {esc(city)}, {esc(city)})")

    with open("05_massive_mock_data_2_orgs.sql", "w", encoding="utf-8") as out:
        out.write("-- ORGS (50)\n")
        for i in range(0, len(org_inserts), batch_size):
            batch = org_inserts[i:i+batch_size]
            out.write("INSERT INTO public.organizations (id, owner_id, name, slug, org_type, official_email, description, status, verified, follower_count, wilaya, city)\nVALUES\n")
            out.write(",\n".join(batch) + "\nON CONFLICT (id) DO NOTHING;\n\n")

    # Generate 300 Events
    print("Generating Events...")
    events = []
    event_inserts = []
    now = datetime.now()
    for i in range(300):
        eid = str(uuid.uuid4())
        events.append(eid)
        org = random.choice(orgs)
        creator = random.choice(users)
        title = f"Massive Event {i}: {random.choice(['Hackathon', 'Tournament', 'Conference', 'Meetup'])}"
        slug = f"event-{i}-{random.randint(1000,9999)}"
        etype = random.choice(event_types)
        
        # random date between -30 days and +60 days
        days_offset = random.randint(-30, 60)
        start = now + timedelta(days=days_offset)
        end = start + timedelta(hours=random.randint(2, 48))
        
        status = 'completed' if end < now else ('live' if start <= now <= end else 'scheduled')
        
        city = random.choice(cities)
        cap = random.randint(50, 1000)
        xp = random.randint(100, 500)
        
        event_inserts.append(f"({esc(eid)}, {esc(org)}, {esc(creator)}, {esc(title)}, {esc(slug)}, {esc(etype)}, {esc(status)}, '{start.isoformat()}', '{end.isoformat()}', {esc(city)}, {esc(city)}, {cap}, {xp}, TRUE)")

    with open("05_massive_mock_data_3_events.sql", "w", encoding="utf-8") as out:
        out.write("-- EVENTS (300)\n")
        for i in range(0, len(event_inserts), batch_size):
            batch = event_inserts[i:i+batch_size]
            out.write("INSERT INTO public.events (id, org_id, created_by, title, slug, event_type, status, starts_at, ends_at, wilaya, city, capacity, xp_checkin, is_paid)\nVALUES\n")
            out.write(",\n".join(batch) + "\nON CONFLICT (id) DO NOTHING;\n\n")

    # Generate Registrations (approx 5-20 per event)
    print("Generating Registrations...")
    reg_inserts = []
    for eid in events:
        num_regs = random.randint(5, 50)
        reg_users = random.sample(users, min(num_regs, len(users)))
        for u in reg_users:
            status = random.choice(['confirmed', 'pending_approval'])
            checked_in = "TRUE" if status == 'confirmed' and random.random() > 0.5 else "FALSE"
            reg_inserts.append(f"(gen_random_uuid(), {esc(eid)}, {esc(u)}, {esc(status)}, {checked_in})")

    with open("05_massive_mock_data_4_regs_1.sql", "w", encoding="utf-8") as out1, \
         open("05_massive_mock_data_4_regs_2.sql", "w", encoding="utf-8") as out2:
        out1.write("-- REGISTRATIONS PART 1\n")
        out2.write("-- REGISTRATIONS PART 2\n")
        
        half = len(reg_inserts) // 2
        
        for i in range(0, half, batch_size):
            batch = reg_inserts[i:i+batch_size]
            out1.write("INSERT INTO public.event_registrations (id, event_id, user_id, status, checked_in)\nVALUES\n")
            out1.write(",\n".join(batch) + "\nON CONFLICT DO NOTHING;\n\n")
            
        for i in range(half, len(reg_inserts), batch_size):
            batch = reg_inserts[i:i+batch_size]
            out2.write("INSERT INTO public.event_registrations (id, event_id, user_id, status, checked_in)\nVALUES\n")
            out2.write(",\n".join(batch) + "\nON CONFLICT DO NOTHING;\n\n")


    # Generate Posts (500)
    print("Generating Posts...")
    post_inserts = []
    for i in range(500):
        pid = str(uuid.uuid4())
        author = random.choice(users)
        content = f"This is an amazing post about {random.choice(event_types)} in {random.choice(cities)}! Loving the Eventfy app."
        likes = random.randint(0, 200)
        comments = random.randint(0, 50)
        post_inserts.append(f"({esc(pid)}, {esc(author)}, {esc(content)}, {likes}, {comments})")

    with open("05_massive_mock_data_5_posts.sql", "w", encoding="utf-8") as out:
        out.write("-- POSTS (500)\n")
        for i in range(0, len(post_inserts), batch_size):
            batch = post_inserts[i:i+batch_size]
            out.write("INSERT INTO public.posts (id, author_id, content, like_count, comment_count)\nVALUES\n")
            out.write(",\n".join(batch) + "\nON CONFLICT DO NOTHING;\n\n")

    print("Massive mock data generated in 7 separate SQL files!")

if __name__ == '__main__':
    generate()
