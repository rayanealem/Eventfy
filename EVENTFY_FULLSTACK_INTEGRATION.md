# EVENTFY — FULLSTACK INTEGRATION MASTER DOCUMENT
## Database → Backend → Frontend — Complete Working Pipeline
### For Claude in Antigravity + Chrome DevTools Verification Protocol

---

> **PURPOSE OF THIS DOCUMENT:**
> Make Eventfy fully dynamic. Every screen reads real data from Supabase.
> Design stays pixel-perfect. Only data wiring and interactivity change.
>
> **HOW TO USE WITH ANTIGRAVITY:**
> Give Claude this entire file as context before each task.
> Follow PHASE ORDER. Do not skip phases.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🗂️ PHASE 0 — SEED DATA (Run first in Supabase SQL Editor)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### CRITICAL — The mock user problem
Supabase RLS requires rows in `auth.users` before you can INSERT into `profiles`.
The `04_seed_data.sql` uses fixed UUIDs that **must exist in auth.users first**.

**Two options:**

**Option A — Manual (Dashboard):**
Go to Supabase Dashboard → Authentication → Users → "Add user" for each:
```
Email: ahmed@eventfy.dz       Password: Demo1234!   → copy the UUID → use in seed
Email: sara@eventfy.dz        Password: Demo1234!
Email: yacine@eventfy.dz      Password: Demo1234!
Email: microclub@eventfy.dz   Password: Demo1234!
Email: greenearth@eventfy.dz  Password: Demo1234!
Email: recruiter@eventfy.dz   Password: Demo1234!
Email: admin@eventfy.dz       Password: Demo1234!
```
Then update the fixed UUIDs at the top of `04_seed_data.sql` with the real UUIDs.

**Option B — SQL (Fastest — bypasses trigger, inserts directly):**
```sql
-- Run BEFORE 04_seed_data.sql
-- This inserts into auth.users directly using fixed UUIDs
-- Only works with Supabase service_role or in SQL Editor

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  role, aud, created_at, updated_at, raw_user_meta_data
)
VALUES
  ('a1000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000000',
   'ahmed@eventfy.dz',
   crypt('Demo1234!', gen_salt('bf')),
   NOW(), 'authenticated', 'authenticated', NOW(), NOW(),
   '{"username":"ahmed_dev","full_name":"Ahmed Benali"}'::jsonb),

  ('a2000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000000',
   'sara@eventfy.dz',
   crypt('Demo1234!', gen_salt('bf')),
   NOW(), 'authenticated', 'authenticated', NOW(), NOW(),
   '{"username":"sara_design","full_name":"Sara Meziane"}'::jsonb),

  ('a3000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000000',
   'yacine@eventfy.dz',
   crypt('Demo1234!', gen_salt('bf')),
   NOW(), 'authenticated', 'authenticated', NOW(), NOW(),
   '{"username":"yacine_ml","full_name":"Yacine Bouzid"}'::jsonb),

  ('b1000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000000',
   'microclub@eventfy.dz',
   crypt('Demo1234!', gen_salt('bf')),
   NOW(), 'authenticated', 'authenticated', NOW(), NOW(),
   '{"username":"microclub_admin","full_name":"Micro Club USTHB"}'::jsonb),

  ('b2000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000000',
   'greenearth@eventfy.dz',
   crypt('Demo1234!', gen_salt('bf')),
   NOW(), 'authenticated', 'authenticated', NOW(), NOW(),
   '{"username":"greenearth_admin","full_name":"Green Earth Algeria"}'::jsonb),

  ('c1000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000000',
   'recruiter@eventfy.dz',
   crypt('Demo1234!', gen_salt('bf')),
   NOW(), 'authenticated', 'authenticated', NOW(), NOW(),
   '{"username":"techcorp_hr","full_name":"TechCorp Algeria HR"}'::jsonb),

  ('d1000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000000',
   'admin@eventfy.dz',
   crypt('Demo1234!', gen_salt('bf')),
   NOW(), 'authenticated', 'authenticated', NOW(), NOW(),
   '{"username":"eventfy_admin","full_name":"Eventfy Admin"}'::jsonb)

ON CONFLICT (id) DO NOTHING;
```

Then run `04_seed_data.sql`.

### Verify seed worked:
```sql
SELECT count(*) as profiles FROM profiles;           -- expect 7
SELECT count(*) as orgs FROM organizations;           -- expect 3
SELECT count(*) as events FROM events;                -- expect 5
SELECT count(*) as registrations FROM event_registrations; -- expect 7
SELECT count(*) as messages FROM messages;            -- expect 9
SELECT count(*) as notifications FROM notifications;  -- expect 5
SELECT title, event_type, status, registration_count
FROM events WHERE status != 'draft' ORDER BY starts_at;
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔌 PHASE 1 — FASTAPI ENDPOINT FIXES
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### The 3 endpoints the frontend hits FIRST (fix these before anything else):

---

#### 1. GET /v1/events/feed
The feed. Most critical endpoint. Returns events + which ones the current user registered for.

```python
# routers/events.py

@router.get("/feed")
async def get_feed(
    scope: str = "local",          # local | national | international
    event_type: str = None,        # sport | science | charity | cultural
    page: int = 1,
    limit: int = 10,
    user = Depends(get_current_user)
):
    query = supabase.table("events")\
        .select("""
            id, title, slug, description, event_type, status,
            starts_at, ends_at, venue_name, city, wilaya,
            cover_url, tags, capacity, registration_count,
            checkin_count, view_count, is_paid, is_international,
            fundraising_goal, fundraising_current,
            organizations!org_id (
                id, name, slug, logo_url, verified
            )
        """)\
        .in_("status", ["live", "scheduled"])\
        .order("starts_at", desc=False)\
        .range((page - 1) * limit, page * limit - 1)

    if event_type:
        query = query.eq("event_type", event_type)

    if scope == "local" and user.get("wilaya"):
        query = query.eq("wilaya", user["wilaya"])
    elif scope == "national":
        query = query.eq("is_international", False)
    elif scope == "international":
        query = query.eq("is_international", True)

    events = query.execute()

    # Get which events this user is registered for
    registrations = supabase.table("event_registrations")\
        .select("event_id")\
        .eq("user_id", user["id"])\
        .execute()

    registered_ids = [r["event_id"] for r in registrations.data]

    # Increment view counts (fire and forget)
    # In production: use a background task

    return {
        "events": events.data,
        "registered_event_ids": registered_ids,
        "page": page,
        "has_more": len(events.data) == limit
    }
```

---

#### 2. GET /v1/events/{event_id}
Full event detail with polymorphic type data.

```python
@router.get("/{event_id}")
async def get_event(event_id: str, user = Depends(get_current_user)):
    # Core event data
    event = supabase.table("events")\
        .select("""
            *,
            organizations!org_id (
                id, name, slug, logo_url, cover_url, verified, description,
                follower_count, event_count
            )
        """)\
        .eq("id", event_id)\
        .single()\
        .execute()

    if not event.data:
        raise HTTPException(404, "Event not found")

    result = event.data
    event_type = result["event_type"]

    # Polymorphic type data
    if event_type == "sport":
        details = supabase.table("event_sport_details")\
            .select("*").eq("event_id", event_id).single().execute()
        result["type_details"] = details.data

    elif event_type == "science":
        details = supabase.table("event_science_details")\
            .select("*").eq("event_id", event_id).single().execute()
        speakers = supabase.table("event_speakers")\
            .select("*").eq("event_id", event_id)\
            .order("sort_order").execute()
        result["type_details"] = details.data
        result["speakers"] = speakers.data

    elif event_type == "charity":
        details = supabase.table("event_charity_details")\
            .select("*").eq("event_id", event_id).single().execute()
        result["type_details"] = details.data

    elif event_type == "cultural":
        details = supabase.table("event_cultural_details")\
            .select("*").eq("event_id", event_id).single().execute()
        performers = supabase.table("event_performers")\
            .select("*").eq("event_id", event_id)\
            .order("sort_order").execute()
        tiers = supabase.table("event_ticket_tiers")\
            .select("*").eq("event_id", event_id)\
            .order("sort_order").execute()
        result["type_details"] = details.data
        result["performers"] = performers.data
        result["ticket_tiers"] = tiers.data

    # Volunteer roles (all event types)
    roles = supabase.table("volunteer_roles")\
        .select("*").eq("event_id", event_id).execute()
    result["volunteer_roles"] = roles.data

    # Current user's registration status
    reg = supabase.table("event_registrations")\
        .select("*")\
        .eq("event_id", event_id)\
        .eq("user_id", user["id"])\
        .execute()
    result["my_registration"] = reg.data[0] if reg.data else None

    # User's volunteer application (if any)
    if reg.data:
        vol_app = supabase.table("volunteer_applications")\
            .select("*, volunteer_roles(name)")\
            .eq("event_id", event_id)\
            .eq("user_id", user["id"])\
            .execute()
        result["my_volunteer_application"] = vol_app.data[0] if vol_app.data else None

    # Increment view count
    supabase.table("events")\
        .update({"view_count": result["view_count"] + 1})\
        .eq("id", event_id).execute()

    return result
```

---

#### 3. GET /v1/auth/me
Who is logged in? Called immediately after any auth event.

```python
@router.get("/me")
async def get_me(user = Depends(get_current_user)):
    # Get profile with badges and skill counts
    profile = supabase.table("profiles")\
        .select("""
            *,
            user_badges (
                badge_id,
                badges ( name, icon_url, shape, color )
            ),
            user_skills (
                skill_id, verified,
                skills ( name, category )
            )
        """)\
        .eq("id", user["id"])\
        .single()\
        .execute()

    # Get orgs this user owns/manages
    orgs = supabase.table("org_members")\
        .select("*, organizations(id, name, slug, logo_url, status, verified)")\
        .eq("user_id", user["id"])\
        .execute()

    return {
        **profile.data,
        "managed_orgs": [m["organizations"] for m in orgs.data]
    }
```

---

### Quick test — verify all 3 endpoints work before touching frontend:
```bash
# Start backend
cd eventfy-backend
uvicorn main:app --reload --port 8000

# In another terminal — get a JWT first by signing in via Supabase
# (or use the Supabase Dashboard → Authentication → Users → copy access token)

# Test feed (unauthenticated first to check CORS and routing)
curl http://localhost:8000/v1/events/feed

# With auth token
TOKEN="eyJ..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/v1/events/feed

# Should return: { "events": [...4 events...], "registered_event_ids": [...] }
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🖥️ PHASE 2 — FRONTEND INTEGRATION
## Screen by screen — design untouched, data wired
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### RULE FOR ALL SCREENS:
```
1. DO NOT change any CSS, className, color, font, spacing, or layout.
2. Replace ONLY: hardcoded strings, static arrays, disabled buttons.
3. ADD: useState, useEffect, useNavigate, useAuth imports.
4. ALL data from API goes through the api() helper in src/lib/api.js.
5. Supabase direct queries only for: auth state, realtime subscriptions.
6. Loading state: show existing skeleton/placeholder design, not a spinner.
7. Error state: show existing empty state design with error message.
```

---

### FILE: src/screens/feed/Feed.jsx

**What the screen shows from DB:**
- Events list (4 cards from seed: Football Cup, AI Summit, Food Drive, Music Festival)
- Each card: cover_url, title, event_type badge, starts_at, city, registration_count/capacity, org name + verified tick
- User's own registration status (registered = coral "YOU'RE IN ✓" button)
- Story bar: orgs the user follows (from org_followers table)

**Full replacement logic — add inside the existing component:**

```javascript
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'

// Inside Feed component:
const navigate = useNavigate()
const { profile } = useAuth()

// State
const [events, setEvents] = useState([])
const [registeredIds, setRegisteredIds] = useState(new Set())
const [scope, setScope] = useState('local')       // local | national | international
const [activeFilter, setActiveFilter] = useState('all')  // all | sport | science | charity | cultural
const [loading, setLoading] = useState(true)
const [followedOrgs, setFollowedOrgs] = useState([])
const [unreadCount, setUnreadCount] = useState(0)

// Load feed on mount + when scope/filter changes
useEffect(() => { loadFeed() }, [scope, activeFilter])

// Load notification count
useEffect(() => { loadNotifications() }, [])

// Realtime: new notifications
useEffect(() => {
  if (!profile) return
  const ch = supabase.channel(`notifs:${profile.id}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${profile.id}`
    }, () => setUnreadCount(n => n + 1))
    .subscribe()
  return () => supabase.removeChannel(ch)
}, [profile])

async function loadFeed() {
  setLoading(true)
  try {
    const params = new URLSearchParams({ scope, page: 1 })
    if (activeFilter !== 'all') params.set('event_type', activeFilter)
    const data = await api('GET', `/events/feed?${params}`)
    setEvents(data.events || [])
    setRegisteredIds(new Set(data.registered_event_ids || []))
  } catch (e) {
    console.error('Feed load failed:', e)
    setEvents([])
  } finally {
    setLoading(false)
  }
}

async function loadNotifications() {
  try {
    const { data } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', profile?.id)
      .eq('is_read', false)
    setUnreadCount(data?.length || 0)
  } catch {}
}

async function loadFollowedOrgs() {
  if (!profile) return
  const { data } = await supabase
    .from('org_followers')
    .select('organizations(id, name, slug, logo_url)')
    .eq('user_id', profile.id)
  setFollowedOrgs(data?.map(f => f.organizations) || [])
}

async function handleRegister(eventId, e) {
  e.stopPropagation()
  if (registeredIds.has(eventId)) return
  setRegisteredIds(prev => new Set([...prev, eventId]))  // optimistic
  try {
    await api('POST', `/events/${eventId}/register`)
  } catch (err) {
    setRegisteredIds(prev => { const s = new Set(prev); s.delete(eventId); return s })
    console.error('Register failed:', err)
  }
}

// DATA FIELD MAPPING — exactly how DB fields map to the card design:
// event.cover_url           → <img src={event.cover_url} />
// event.event_type          → badge shape: sport=○ science=△ charity=□ cultural=◇
// event.title               → Bebas Neue card title
// event.starts_at           → format: "JAN 15" or "IN 2 DAYS"
// event.city + event.wilaya → location chip
// event.registration_count  → "284 PLAYERS"
// event.capacity            → "of 500" or "UNLIMITED"
// event.organizations.name  → org name below title
// event.organizations.verified → show ✓ teal badge
// event.is_paid             → show price chip or "FREE"
// registeredIds.has(id)     → button state: "ENTER THE GAME" vs "YOU'RE IN ✓"

// DATE FORMATTING HELPER:
function formatEventDate(startsAt) {
  const date = new Date(startsAt)
  const now = new Date()
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'TODAY'
  if (diffDays === 1) return 'TOMORROW'
  if (diffDays < 7) return `IN ${diffDays} DAYS`
  return date.toLocaleDateString('en-DZ', { day: '2-digit', month: 'short' }).toUpperCase()
}

// TYPE BADGE CONFIG:
const TYPE_CONFIG = {
  sport:    { label: '○ SPORT',    color: '#FF4D4D', border: '1px solid #FF4D4D' },
  science:  { label: '△ SCIENCE',  color: '#00E5CC', border: '1px solid #00E5CC' },
  charity:  { label: '□ CHARITY',  color: '#FFD700', border: '1px solid #FFD700' },
  cultural: { label: '◇ CULTURAL', color: '#FF2D78', border: '1px solid #FF2D78' },
}

// EMPTY STATE — use existing empty state design, pass this condition:
// if (!loading && events.length === 0) → show empty state
```

**Wiring existing JSX elements — find these and add handlers:**
```javascript
// Search bar onClick:
onClick={() => navigate('/explore')}

// Notification bell:
onClick={() => navigate('/notifications')}
// Badge count: show {unreadCount} if unreadCount > 0

// Own avatar (top right):
onClick={() => navigate('/profile/me')}

// Scope toggle pills [LOCAL / NATIONAL / INTERNATIONAL]:
onClick={() => setScope('local')}    // LOCAL pill
onClick={() => setScope('national')} // NATIONAL pill
onClick={() => { setScope('international'); /* show travel banner */ }} // INTERNATIONAL

// Filter pills [ALL / SPORT / SCIENCE / CHARITY / CULTURAL]:
onClick={() => setActiveFilter('all')}
onClick={() => setActiveFilter('sport')}
// etc.

// Event card body tap:
onClick={() => navigate(`/event/${event.id}`)}

// REGISTER button on card:
onClick={(e) => handleRegister(event.id, e)}
// Text: registeredIds.has(event.id) ? `YOU'RE IN ✓` : 'ENTER THE GAME ○'
// Style: registeredIds.has(event.id) ? teal background : coral background

// Org name on card:
onClick={(e) => { e.stopPropagation(); navigate(`/org/${event.organizations.slug}`) }}

// FAB button:
onClick={() => {
  if (profile?.role === 'organizer') navigate('/event/create')
  // else show tooltip — already designed, just add useState(showFabTooltip)
}}

// Story ring:
onClick={() => navigate(`/stories/${org.id}`)}

// Bottom nav — already in BottomNav.jsx but verify:
// ○ FEED → navigate('/feed')
// △ EXPLORE → navigate('/explore')
// □ MY EVENTS → navigate('/profile/me')
// ◇ PROFILE → navigate('/profile/me')
// ⬡ CHAT → navigate('/chat')
```

---

### FILE: src/screens/event/EventDetail.jsx

**What the screen shows from DB:**
The `GET /v1/events/:id` endpoint returns the full event + type_details + speakers/performers/tiers + volunteer_roles + my_registration status.

```javascript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'

// Inside EventDetail:
const { id } = useParams()
const navigate = useNavigate()
const { profile } = useAuth()

const [event, setEvent] = useState(null)
const [activeTab, setActiveTab] = useState('info')
const [loading, setLoading] = useState(true)
const [registering, setRegistering] = useState(false)

useEffect(() => {
  loadEvent()
}, [id])

async function loadEvent() {
  setLoading(true)
  try {
    const data = await api('GET', `/events/${id}`)
    setEvent(data)
  } catch (e) {
    console.error('Event load failed:', e)
  } finally {
    setLoading(false)
  }
}

async function handleRegister() {
  if (!event || registering) return
  setRegistering(true)
  try {
    await api('POST', `/events/${event.id}/register`)
    // Reload event to get updated my_registration
    await loadEvent()
  } catch (e) {
    console.error('Register failed:', e)
  } finally {
    setRegistering(false)
  }
}

// REGISTER BUTTON STATE LOGIC:
function getRegisterButtonState() {
  if (!event) return { text: 'LOADING...', style: 'loading' }
  if (event.my_registration) {
    return {
      text: `YOU'RE IN ✓  —  PLAYER #${profile?.player_number}`,
      style: 'registered'    // teal background
    }
  }
  if (event.registration_count >= event.capacity) {
    return { text: 'JOIN WAITLIST △', style: 'waitlist' }  // gold outline
  }
  return { text: 'ENTER THE GAME ○', style: 'default' }    // coral fill
}

// POLYMORPHIC SECTION — inside INFO tab render:
function renderTypeSection() {
  if (!event) return null
  switch (event.event_type) {
    case 'sport':
      return <SportSection details={event.type_details} eventId={event.id} />
    case 'science':
      return <ScienceSection details={event.type_details} speakers={event.speakers} />
    case 'charity':
      return (
        <CharitySection
          details={event.type_details}
          goal={event.fundraising_goal}
          current={event.fundraising_current}
        />
      )
    case 'cultural':
      return (
        <CulturalSection
          details={event.type_details}
          performers={event.performers}
          tiers={event.ticket_tiers}
        />
      )
    default:
      return null
  }
}

// DATA FIELD MAPPING:
// event.cover_url                     → hero background image
// event.event_type                    → type badge + polymorphic section
// event.title                         → Bebas Neue 48px hero text
// event.organizations.name            → "by Micro Club USTHB"
// event.organizations.verified        → ✓ teal badge
// event.organizations.logo_url        → hexagonal org avatar
// event.starts_at / event.ends_at     → date chips
// event.venue_name + event.city       → location chip
// event.registration_count            → "284 REGISTERED"
// event.capacity                      → "of 500" capacity pill
// event.xp_checkin                    → gamification card "+100 XP"
// event.xp_completion                 → "+200 XP completion"
// event.volunteer_roles               → VOLUNTEERS tab role cards
// event.my_registration               → register button state
// event.type_details                  → polymorphic section data
// event.speakers                      → science: speaker cards
// event.performers                    → cultural: performer lineup
// event.ticket_tiers                  → cultural: ticket table
// event.fundraising_goal              → charity: progress bar max
// event.fundraising_current           → charity: progress bar fill
```

**Polymorphic sections — create as sub-components inside EventDetail.jsx:**

```javascript
// SPORT SECTION
function SportSection({ details, eventId }) {
  if (!details) return null
  return (
    // Use existing sport section design.
    // Wire these fields:
    // details.team_a_name → Team A card
    // details.team_b_name → Team B card
    // details.team_a_score → score (if live/completed)
    // details.team_b_score → score
    // details.league_name → league badge
    // "JOIN A TEAM △" onClick → navigate(`/event/${eventId}/teams`)
    <div>
      <div>{details.team_a_name} <span>VS</span> {details.team_b_name}</div>
      {details.team_a_score !== null && (
        <div>{details.team_a_score} — {details.team_b_score}</div>
      )}
      <button onClick={() => navigate(`/event/${eventId}/teams`)}>JOIN A TEAM △</button>
    </div>
  )
}

// SCIENCE SECTION
function ScienceSection({ details, speakers }) {
  if (!details) return null
  const deadline = details.submission_deadline ? new Date(details.submission_deadline) : null
  const isOpen = deadline && deadline > new Date()
  return (
    // details.call_for_papers → show/hide "CALL FOR PAPERS" card
    // isOpen → "OPEN ✓" teal vs "CLOSED ✗" coral
    // deadline → countdown timer
    // speakers.map → speaker cards (photo, name, title, topic)
    <div>{/* use existing design, wire fields above */}</div>
  )
}

// CHARITY SECTION
function CharitySection({ details, goal, current }) {
  const percent = goal ? Math.round((current / goal) * 100) : 0
  return (
    // percent → progress bar fill width: `${percent}%`
    // current → "DZD 847,000" formatted
    // goal → "of DZD 2,000,000 goal"
    // percent → "42%" big number
    <div>{/* use existing design */}</div>
  )
}

// CULTURAL SECTION
function CulturalSection({ details, performers, tiers }) {
  return (
    // performers.map → performer cards (name, stage_name, time_slot)
    // tiers.map → ticket tier rows (name, price, perks, quantity - sold)
    <div>{/* use existing design */}</div>
  )
}
```

---

### FILE: src/screens/auth/ParticipantLoginAuth.jsx

```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// Inside component:
const navigate = useNavigate()
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [showPassword, setShowPassword] = useState(false)

async function handleLogin(e) {
  e?.preventDefault()
  if (!email || !password) return
  setLoading(true)
  setError('')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // AuthContext.onAuthStateChange fires automatically
    // Check if onboarding done
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', data.user.id)
      .single()
    navigate(profile?.onboarding_done ? '/feed' : '/onboarding/1')
  } catch (err) {
    setError(err.message || 'Login failed. Check your credentials.')
  } finally {
    setLoading(false)
  }
}

// Wire existing form elements:
// email input: value={email} onChange={e => setEmail(e.target.value)}
// password input: value={password} onChange={e => setPassword(e.target.value)}
//                 type={showPassword ? 'text' : 'password'}
// eye toggle: onClick={() => setShowPassword(!showPassword)}
// ENTER button: onClick={handleLogin} disabled={loading}
//               text: loading ? 'ENTERING...' : 'ENTER □'
// Error message: {error && <p className="error">{error}</p>}
// "Don't have an account?": onClick={() => navigate('/auth/participant/register')}
// "Log in as Organization": onClick={() => navigate('/auth/org/login')}
// ← Back: onClick={() => navigate('/splash')}

// DEMO LOGIN SHORTCUT (for testing — remove in production):
function handleDemoLogin() {
  setEmail('ahmed@eventfy.dz')
  setPassword('Demo1234!')
  handleLogin()
}
```

---

### FILE: src/screens/auth/ParticipantRegisterAuth.jsx

```javascript
async function handleRegister(e) {
  e?.preventDefault()
  setLoading(true)
  setError('')
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName }
      }
    })
    if (error) throw error
    // Trigger profile setup via API (sets wilaya, skills, etc.)
    await api('POST', '/auth/register/participant', {
      username, full_name: fullName, wilaya, is_student: isStudent,
      university: isStudent ? university : null,
      study_year: isStudent ? studyYear : null
    })
    navigate('/onboarding/1')
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

---

### FILE: src/screens/auth/OrgRegisterAuth.jsx

```javascript
// STATE A → STATE B transition
const [formState, setFormState] = useState('form')  // 'form' | 'pending' | 'rejected'
const [rejectionReason, setRejectionReason] = useState('')
const [orgId, setOrgId] = useState(null)

async function handleRequest(e) {
  e?.preventDefault()
  setLoading(true)
  try {
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    // 2. Create org via API
    const org = await api('POST', '/orgs', {
      name: orgName, org_type: orgType, official_email: officialEmail,
      registration_number: regNumber, description
    })
    setOrgId(org.id)
    setFormState('pending')  // Switch to STATE B — same screen
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

// Realtime: listen for admin approval on this org
useEffect(() => {
  if (!orgId || formState !== 'pending') return
  const ch = supabase.channel(`org_status:${orgId}`)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public',
      table: 'organizations',
      filter: `id=eq.${orgId}`
    }, payload => {
      if (payload.new.status === 'approved') navigate('/org/setup')
      if (payload.new.status === 'rejected') {
        setRejectionReason(payload.new.rejection_reason)
        setFormState('rejected')
      }
    })
    .subscribe()
  return () => supabase.removeChannel(ch)
}, [orgId, formState])

// Render STATE B (pending):
// formState === 'pending' → show pending card, hide form
// formState === 'rejected' → show rejection reason, show form again
// formState === 'form' → show form
```

---

### FILE: src/screens/onboarding/Onboarding.jsx (Step 1)

```javascript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const { profile } = useAuth()
const navigate = useNavigate()

// Animate the player number counting up to profile.player_number
const [displayNumber, setDisplayNumber] = useState(1)
const targetNumber = profile?.player_number || 4821

useEffect(() => {
  // Count up animation: start from targetNumber - 5, end at targetNumber
  const start = Math.max(1, targetNumber - 5)
  let current = start
  const interval = setInterval(() => {
    setDisplayNumber(current)
    current++
    if (current > targetNumber) {
      clearInterval(interval)
      setDisplayNumber(targetNumber)
    }
  }, 300)
  return () => clearInterval(interval)
}, [targetNumber])

// Wire: "BEGIN YOUR JOURNEY ○" → navigate('/onboarding/2')
// Display: #{displayNumber} animated number
// Use profile?.player_number for the real assigned number
```

---

### FILE: src/screens/profile/PlayerProfile.jsx

```javascript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

const { username } = useParams()
const { profile: myProfile } = useAuth()
const isOwnProfile = username === 'me' || username === myProfile?.username

const [profile, setProfile] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadProfile()
}, [username])

async function loadProfile() {
  setLoading(true)
  try {
    const target = isOwnProfile ? myProfile?.username : username
    const data = await api('GET', `/users/${target}`)
    setProfile(data)
  } finally {
    setLoading(false)
  }
}

// DATA FIELD MAPPING:
// profile.avatar_url          → hexagonal avatar src
// profile.player_number       → #4821 badge
// profile.full_name           → Bebas Neue name
// profile.username            → @handle DM Mono
// profile.bio                 → bio text
// profile.city                → location chip
// profile.university          → student chip (if is_student)
// profile.xp                  → XP stat card
// profile.level               → LEVEL 7 bar
// profile.user_badges         → badges grid (hexagonal badge icons)
// profile.user_skills         → skills section (verified vs unverified)

// XP LEVEL PROGRESS:
const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7000, 10000, 14000, 19000, 25000]
function getLevelProgress(xp, level) {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0
  const nextThreshold = LEVEL_THRESHOLDS[level] || 25000
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  return { progress: Math.min(100, progress), xpToNext: nextThreshold - xp }
}
```

---

### FILE: src/screens/chat/Chat.jsx

```javascript
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'

const { eventId } = useParams()
const { profile } = useAuth()
const [channels, setChannels] = useState([])
const [activeChannelId, setActiveChannelId] = useState(null)
const [messages, setMessages] = useState([])
const [input, setInput] = useState('')
const bottomRef = useRef(null)

// Load channels + first message history
useEffect(() => {
  if (!eventId) return
  api('GET', `/chat/channels/${eventId}`).then(data => {
    setChannels(data.channels)
    const general = data.channels.find(c => c.name === 'general')
    if (general) {
      setActiveChannelId(general.id)
      setMessages(data.messages || [])
    }
  })
}, [eventId])

// Realtime: subscribe to new messages in active channel
useEffect(() => {
  if (!activeChannelId) return
  const ch = supabase.channel(`chat:${activeChannelId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public',
      table: 'messages',
      filter: `channel_id=eq.${activeChannelId}`
    }, payload => {
      setMessages(prev => [...prev, payload.new])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })
    .subscribe()
  return () => supabase.removeChannel(ch)
}, [activeChannelId])

// Load messages when switching channels
async function switchChannel(channelId) {
  setActiveChannelId(channelId)
  const data = await api('GET', `/chat/channels/${channelId}/messages`)
  setMessages(data.messages)
}

// SEND — this was the main broken button
async function handleSend() {
  const text = input.trim()
  if (!text) return
  setInput('')  // Clear immediately (optimistic)
  try {
    await api('POST', `/chat/channels/${activeChannelId}/messages`, { content: text })
    // Realtime subscription adds it to messages array automatically
  } catch (e) {
    setInput(text)  // Restore on failure
    console.error('Send failed:', e)
  }
}

// Wire existing JSX:
// Text input: value={input} onChange={e => setInput(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
// Send button: onClick={handleSend}  ← THIS WAS BROKEN
// Channel list: channels.map → each onClick={() => switchChannel(ch.id)}
// Messages list: messages.map → each with sender profile data
// Locked channel (#staff-only): show lock icon if ch.is_locked && userIsNotVolunteer
// Scroll anchor: <div ref={bottomRef} />  at bottom of messages list
```

---

### FILE: src/screens/notifications/Notifications.jsx

```javascript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const { profile } = useAuth()
const navigate = useNavigate()
const [notifications, setNotifications] = useState([])
const [filter, setFilter] = useState('all')   // all | events | social | system

useEffect(() => { loadNotifications() }, [filter])

async function loadNotifications() {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  if (filter === 'events') query = query.in('type', ['event_update','registration_confirmed','event_starts_soon','flash_alert'])
  if (filter === 'social') query = query.in('type', ['new_follower','connection_request','new_message'])
  if (filter === 'system') query = query.in('type', ['badge_earned','xp_gained','level_up','volunteer_approved'])

  const { data } = await query
  setNotifications(data || [])
}

async function markAllRead() {
  await supabase.from('notifications')
    .update({ is_read: true })
    .eq('user_id', profile.id)
  setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
}

// NOTIFICATION TAP ROUTING — navigate based on type + data:
function handleNotificationTap(notif) {
  // Mark as read
  supabase.from('notifications').update({ is_read: true }).eq('id', notif.id)
  setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, is_read: true} : n))
  // Navigate
  if (notif.data?.event_id) navigate(`/event/${notif.data.event_id}`)
  else if (notif.data?.user_id) navigate(`/profile/${notif.data.username}`)
  else if (notif.data?.org_id) navigate(`/org/${notif.data.org_id}`)
}

// NOTIFICATION SHAPE/COLOR by type:
const TYPE_STYLE = {
  event_update:           { shape: '○', color: '#FF4D4D' },
  registration_confirmed: { shape: '○', color: '#FF4D4D' },
  new_follower:           { shape: '△', color: '#00E5CC' },
  connection_request:     { shape: '△', color: '#00E5CC' },
  badge_earned:           { shape: '□', color: '#F5F5F0' },
  xp_gained:              { shape: '□', color: '#F5F5F0' },
  level_up:               { shape: '□', color: '#F5F5F0' },
  golden_ticket:          { shape: '◇', color: '#FFD700' },
  flash_alert:            { shape: '◇', color: '#FFD700' },
  volunteer_approved:     { shape: '△', color: '#00E5CC' },
}

// Wire existing JSX:
// ← Back: onClick={() => navigate(-1)}
// "MARK ALL READ": onClick={markAllRead}
// Filter tabs: onClick={() => setFilter('all' | 'events' | 'social' | 'system')}
// Notification list: notifications.map(n => { /* render notif card */ })
//   - TYPE_STYLE[n.type].shape → shape icon
//   - TYPE_STYLE[n.type].color → shape color
//   - n.is_read → opacity (unread = full, read = 60%)
//   - n.created_at → time ago format
//   - n.body → notification text
//   - onClick={() => handleNotificationTap(n)}
```

---

### FILE: src/components/BottomNav.jsx
**This was the root cause of ALL navigation being broken.**

```javascript
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const navigate = useNavigate()
const location = useLocation()
const { profile } = useAuth()
const [unreadCount, setUnreadCount] = useState(0)

// Determine active tab from current path
const activeTab = (() => {
  const p = location.pathname
  if (p.startsWith('/feed') || p === '/') return 'feed'
  if (p.startsWith('/explore') || p.startsWith('/search')) return 'explore'
  if (p.startsWith('/profile') && p.includes('me')) return 'profile'
  if (p.startsWith('/profile') || p.startsWith('/org')) return 'profile'
  if (p.startsWith('/chat')) return 'chat'
  return 'feed'
})()

// Unread notification count for bell on ⬡ CHAT badge
useEffect(() => {
  if (!profile) return
  supabase.from('notifications').select('id', { count: 'exact' })
    .eq('user_id', profile.id).eq('is_read', false)
    .then(({ data }) => setUnreadCount(data?.length || 0))
}, [profile])

const TABS = [
  { id: 'feed',    shape: '○', label: 'FEED',      path: '/feed' },
  { id: 'explore', shape: '△', label: 'EXPLORE',   path: '/explore' },
  { id: 'events',  shape: '□', label: 'MY EVENTS', path: '/profile/me' },
  { id: 'profile', shape: '◇', label: 'PROFILE',   path: '/profile/me' },
  { id: 'chat',    shape: '⬡', label: 'CHAT',      path: '/chat',
    badge: unreadCount > 0 ? unreadCount : null },
]

// Wire each tab button:
// onClick={() => navigate(tab.path)}
// Active state: tab.id === activeTab → filled shape + role color underline
// Badge: tab.badge → small coral circle with count
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔍 PHASE 3 — CHROME DEVTOOLS VERIFICATION PROTOCOL
## Run these checks after each screen is wired
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Open Chrome DevTools: F12 → Network tab

---

### CHECK 1: Feed loads real events
```
ACTION: Open http://localhost:5173/feed (logged in as ahmed@eventfy.dz)
DEVTOOLS: Network tab → filter by "XHR/Fetch"

EXPECT TO SEE:
  Request:  GET http://localhost:8000/v1/events/feed?scope=local
  Status:   200
  Response preview: {
    "events": [
      { "title": "Inter-Uni Football Cup 2026", "event_type": "sport", ... },
      { "title": "Ramadan Food Drive 2026", "event_type": "charity", ... }
    ],
    "registered_event_ids": [
      "f1000000-0000-0000-0000-000000000001",  ← Ahmed is registered for sport
      "f2000000-0000-0000-0000-000000000002",  ← and science
      "f3000000-0000-0000-0000-000000000003"   ← and charity
    ]
  }

FAIL INDICATORS:
  ✗ Status 401 → Auth token not being sent. Check api.js Authorization header.
  ✗ Status 404 → Route prefix wrong. Check uvicorn is running + route is /v1/events/feed
  ✗ Status 422 → Pydantic validation error. Check FastAPI logs in terminal.
  ✗ Status 500 → Supabase query error. Check FastAPI terminal for the traceback.
  ✗ Empty events [] → Seed data not inserted. Run verification queries in Supabase SQL Editor.
  ✗ CORS error → CORSMiddleware not configured for http://localhost:5173
```

---

### CHECK 2: Event detail loads polymorphic data
```
ACTION: Click on "Inter-Uni Football Cup" card in feed
DEVTOOLS: Network tab

EXPECT:
  Request:  GET http://localhost:8000/v1/events/f1000000-0000-0000-0000-000000000001
  Response preview: {
    "event_type": "sport",
    "type_details": {
      "team_a_name": "Valiant FC",
      "team_b_name": "Titan UTD",
      "team_a_score": 3,
      "team_b_score": 1
    },
    "my_registration": { "status": "confirmed", ... },
    "volunteer_roles": [...]
  }

DESIGN CHECK (Elements tab):
  → The sport section "MATCH DETAILS ○" should show Valiant FC vs Titan UTD
  → Score 3 — 1 should be visible in DM Mono
  → Register button should say "YOU'RE IN ✓ — PLAYER #1" (Ahmed's player number)
  → VOLUNTEERS tab should show 2 roles: "Gate Keeper" + "Media Team"
```

---

### CHECK 3: Auth flow
```
ACTION: Go to /splash → "JOIN THE GAME" → register new participant
DEVTOOLS: Network tab

EXPECT SEQUENCE:
  1. POST https://[project].supabase.co/auth/v1/signup  → 200
     (Supabase Auth creates the user)
  2. POST http://localhost:8000/v1/auth/register/participant  → 201
     (FastAPI updates the profile with wilaya, skills etc.)
  3. Navigate to /onboarding/1
     Player number animates from [N-5] to [N] (real DB number)

FAIL INDICATORS:
  ✗ Supabase signup 400 "User already registered" → email already in DB
  ✗ FastAPI 422 → profile insert missing required fields
  ✗ Stays on register page → navigate() not called after successful signup
```

---

### CHECK 4: Chat send button
```
ACTION: Navigate to /chat/{sport-event-id}. Type a message. Click send.
DEVTOOLS: Network tab + Console tab

EXPECT:
  Request: POST http://localhost:8000/v1/chat/channels/{channelId}/messages
  Body:    { "content": "your message" }
  Status:  201
  
  Then: message appears in the chat list WITHOUT a page refresh
  (Supabase Realtime INSERT fires → React state updates)

DEVTOOLS Console — Supabase realtime debug:
  supabase.getChannels()
  → Should show: [ { topic: 'realtime:chat:{channelId}', state: 'joined' } ]

FAIL INDICATORS:
  ✗ No POST request → onClick handler not connected to send function
  ✗ 401 → auth token not in request
  ✗ Message appears only after refresh → Realtime subscription not set up
  ✗ console.error "channel not found" → channelId is null (event channels not seeded)
```

---

### CHECK 5: Notifications real data
```
ACTION: Navigate to /notifications (as ahmed@eventfy.dz)
DEVTOOLS: Network tab

EXPECT:
  Direct Supabase query (no FastAPI) — look for:
  Request: GET https://[project].supabase.co/rest/v1/notifications?...
  Response: 5 notifications including:
    - "Volunteer Approved ✓" (type: volunteer_approved) — UNREAD
    - "Badge Unlocked: Community Hero" (type: badge_earned) — UNREAD
    - "New Connection" (type: new_follower) — READ
    - "Golden Ticket Offer" (type: golden_ticket) — UNREAD

DESIGN CHECK:
  → 3 unread notifications → bell badge should show "3" in BottomNav
  → Unread items → full opacity cards
  → Read items → 60% opacity
  → Golden Ticket card → gold border glow
```

---

### CHECK 6: Realtime subscription debug
```
ACTION: In Chrome DevTools Console, paste:

// Check all active Supabase realtime channels
console.table(
  window.__supabase?.getChannels?.()?.map(ch => ({
    topic: ch.topic,
    state: ch.state,
    joinedOnce: ch.joinedOnce
  })) || 'supabase not on window — add window.__supabase = supabase in lib/supabase.js'
)

// Add to src/lib/supabase.js for debugging:
export const supabase = createClient(url, key)
if (import.meta.env.DEV) window.__supabase = supabase

EXPECT (when on chat page):
  topic: "realtime:chat:{channelId}"   state: "joined"

EXPECT (when logged in anywhere):
  topic: "realtime:notifications:{userId}"   state: "joined"
```

---

### CHECK 7: Verify mock data end-to-end
```
ACTION: Run in Chrome DevTools Console (on any page while logged in):

// Test Supabase direct query
const { createClient } = await import('https://esm.sh/@supabase/supabase-js')
// (or use the already-imported supabase if window.__supabase is set)

window.__supabase.from('events')
  .select('title, event_type, status, registration_count')
  .neq('status', 'draft')
  .then(({ data, error }) => {
    console.table(data)
    console.log('Error:', error)
  })

EXPECT:
  ┌─────────────────────────────────────┬─────────────┬───────────┬────────────────────┐
  │ title                               │ event_type  │ status    │ registration_count │
  ├─────────────────────────────────────┼─────────────┼───────────┼────────────────────┤
  │ Inter-Uni Football Cup 2026         │ sport       │ live      │ 284                │
  │ Inter-Uni AI Summit 2026            │ science     │ scheduled │ 87                 │
  │ Ramadan Food Drive 2026             │ charity     │ live      │ 94                 │
  │ Algiers Music Festival 2026         │ cultural    │ scheduled │ 412                │
  └─────────────────────────────────────┴─────────────┴───────────┴────────────────────┘
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🚨 COMMON FAILURES & FIXES
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| All API calls return 401 | JWT not in Authorization header | Check `api.js` — `getSession()` must be awaited |
| Feed shows empty but DB has data | RLS blocking read | Run: `SELECT * FROM events WHERE status != 'draft'` in Supabase SQL Editor. If returns data → RLS issue. Add policy. |
| "NetworkError" / CORS error | FastAPI CORS config | Add `http://localhost:5173` to `allow_origins` in `main.py` |
| EventDetail crashes on mount | `event.type_details` is null | Seed the type-specific tables (`event_sport_details` etc.) |
| Chat messages not appearing in real-time | Realtime not enabled on table | Supabase Dashboard → Database → Replication → enable `messages` table |
| Player number shows undefined | Profile not loaded yet | Check `AuthContext.jsx` — profile fetch must complete before rendering |
| Register button does nothing | onClick not wired | Add `onClick={handleRegister}` to existing button element |
| Notifications show 0 | Notification RLS too strict | Check policy: `user_id = auth.uid()` — must match exactly |
| Supabase 406 "Not Acceptable" | `.single()` on empty result | Use `.maybeSingle()` instead of `.single()` |
| Auth redirect loop | GuestGuard + AuthGuard conflict | Check `AppRouter.jsx` — /splash and /auth/* must use GuestGuard ONLY |
| `profile is null` crashes | Auth state loading | All profile-dependent code: `if (!profile) return null` |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📋 TASK CHECKLIST FOR ANTIGRAVITY
## Run in this exact order
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
PHASE 0 — DATABASE
  [ ] Run auth users SQL (Option B) in Supabase SQL Editor
  [ ] Run 04_seed_data.sql
  [ ] Run verification queries → confirm all 5 tables have data
  [ ] Enable Realtime on: messages, event_registrations, organizations, notifications

PHASE 1 — BACKEND
  [ ] Confirm uvicorn running: http://localhost:8000/docs
  [ ] Fix GET /v1/events/feed → returns 4 seed events + registered_event_ids
  [ ] Fix GET /v1/events/:id → returns full polymorphic data for each type
  [ ] Fix GET /v1/auth/me → returns profile with badges + skills
  [ ] Fix POST /v1/events/:id/register → creates row in event_registrations
  [ ] Fix GET /v1/chat/channels/:eventId → returns channels + recent messages
  [ ] Fix POST /v1/chat/channels/:id/messages → inserts message row

PHASE 2 — FRONTEND (in this order)
  [ ] BottomNav.jsx — wire all 5 tabs with useNavigate + useLocation active state
  [ ] Splash.jsx — wire all 3 buttons
  [ ] ParticipantLoginAuth.jsx — wire form → supabase.auth.signInWithPassword
  [ ] ParticipantRegisterAuth.jsx — wire form → supabase.auth.signUp
  [ ] OrgRegisterAuth.jsx — wire form + pending state + realtime approval
  [ ] Feed.jsx — replace static events with api('/events/feed') + all button handlers
  [ ] EventDetail.jsx — replace static data + polymorphic sections + register button
  [ ] Notifications.jsx — replace static with supabase.from('notifications') query
  [ ] Chat.jsx — wire send button + channel switching + realtime subscription
  [ ] PlayerProfile.jsx — replace static with api('/users/:username')

PHASE 3 — VERIFICATION (Chrome DevTools)
  [ ] CHECK 1: Feed loads 4 events (Network tab)
  [ ] CHECK 2: EventDetail shows polymorphic data (sport: Valiant FC vs Titan UTD)
  [ ] CHECK 3: Auth flow creates user + navigates to /onboarding/1
  [ ] CHECK 4: Chat send button creates DB row + message appears via Realtime
  [ ] CHECK 5: Notifications show 5 items with correct read/unread state
  [ ] CHECK 6: Supabase Realtime channels are joined (Console tab)
  [ ] CHECK 7: Direct DB query returns 4 events with correct data
```

---

> **DESIGN CONTRACT:**
> The Figma-accurate pixel-perfect design is final and must not change.
> Every element listed above wires existing JSX to real data.
> Do not add new UI elements. Do not change CSS classes.
> Only add: data fetching, state management, event handlers, navigation calls.
