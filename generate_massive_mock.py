import uuid
import random
from datetime import datetime, timedelta

def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def generate():
    out = open("05_massive_mock_data.sql", "w", encoding="utf-8")
    out.write("-- EVENTFY MASSIVE MOCK DATA\\n")
    out.write("-- Generated via Python Script\\n\\n")

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
        
        user_inserts.append(f"({esc(uid)}, {esc(username)}, {esc(fn)}, {esc(bio)}, {esc(city)}, {esc(city)}, {esc(shape)}, {esc(color)}, {is_student}, 'participant', {xp}, {lvl}, TRUE)")

    out.write("-- USERS (1000)\\n")
    # batch insert
    batch_size = 50
    for i in range(0, len(user_inserts), batch_size):
        batch = user_inserts[i:i+batch_size]
        out.write("INSERT INTO profiles (id, username, full_name, bio, wilaya, city, shape, shape_color, is_student, role, xp, level, onboarding_done)\\nVALUES\\n")
        out.write(",\\n".join(batch) + "\\nON CONFLICT (id) DO NOTHING;\\n\\n")


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

    out.write("-- ORGS (50)\\n")
    for i in range(0, len(org_inserts), batch_size):
        batch = org_inserts[i:i+batch_size]
        out.write("INSERT INTO organizations (id, owner_id, name, slug, org_type, official_email, description, status, verified, follower_count, wilaya, city)\\nVALUES\\n")
        out.write(",\\n".join(batch) + "\\nON CONFLICT (id) DO NOTHING;\\n\\n")

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

    out.write("-- EVENTS (300)\\n")
    for i in range(0, len(event_inserts), batch_size):
        batch = event_inserts[i:i+batch_size]
        out.write("INSERT INTO events (id, org_id, created_by, title, slug, event_type, status, starts_at, ends_at, wilaya, city, capacity, xp_checkin, is_paid)\\nVALUES\\n")
        out.write(",\\n".join(batch) + "\\nON CONFLICT (id) DO NOTHING;\\n\\n")

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

    out.write("-- REGISTRATIONS (10000+)\\n")
    for i in range(0, len(reg_inserts), batch_size):
        batch = reg_inserts[i:i+batch_size]
        out.write("INSERT INTO event_registrations (id, event_id, user_id, status, checked_in)\\nVALUES\\n")
        out.write(",\\n".join(batch) + "\\nON CONFLICT DO NOTHING;\\n\\n")

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

    out.write("-- POSTS (500)\\n")
    for i in range(0, len(post_inserts), batch_size):
        batch = post_inserts[i:i+batch_size]
        out.write("INSERT INTO posts (id, author_id, content, like_count, comment_count)\\nVALUES\\n")
        out.write(",\\n".join(batch) + "\\nON CONFLICT DO NOTHING;\\n\\n")

    out.close()
    print("Massive mock data generated in 05_massive_mock_data.sql")

if __name__ == '__main__':
    generate()
