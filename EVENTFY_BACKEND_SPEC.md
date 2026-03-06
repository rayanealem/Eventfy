# EVENTFY — COMPLETE BACKEND & DATABASE SPECIFICATION
## Stack: FastAPI + Supabase (Postgres + Auth + Realtime + Storage)
### v1.0 — Full schema, API routes, RLS policies, realtime channels, frontend wiring

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📦 STACK OVERVIEW
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
FRONTEND          React (Vite) — existing project
  ↕ HTTPS REST    FastAPI — business logic, complex queries, file processing
  ↕ Supabase JS   @supabase/supabase-js — auth, realtime, storage direct from frontend

BACKEND           FastAPI (Python 3.11+)
  ↕               supabase-py — server-side DB operations
  ↕               python-jose — JWT validation
  ↕               Pillow — image processing (avatar crops, passport PDF)

DATABASE          Supabase (PostgreSQL 15)
  ↕               PostGIS — geo queries (events near me, distance)
  ↕               pg_cron — scheduled jobs (expire QR tokens, close registrations)

REALTIME          Supabase Realtime
                  — chat messages
                  — check-in feed (org command center)
                  — org approval notifications
                  — live event counters

STORAGE           Supabase Storage
                  — avatars (bucket: avatars)
                  — event covers (bucket: events)
                  — org logos/docs (bucket: orgs)
                  — certificates PDF (bucket: certificates)
                  — story media (bucket: stories)
                  — post attachments (bucket: posts)

AUTH              Supabase Auth
                  — email/password
                  — Google OAuth
                  — JWT issued per session
                  — RLS enforced at DB level
```

### Project structure:
```
eventfy-backend/
├── main.py                  ← FastAPI app entry point
├── config.py                ← env vars, Supabase client init
├── requirements.txt
│
├── routers/
│   ├── auth.py              ← /auth/*
│   ├── users.py             ← /users/*
│   ├── events.py            ← /events/*
│   ├── organizations.py     ← /orgs/*
│   ├── registrations.py     ← /registrations/*
│   ├── volunteers.py        ← /volunteers/*
│   ├── teams.py             ← /teams/*
│   ├── chat.py              ← /chat/*
│   ├── stories.py           ← /stories/*
│   ├── qr.py                ← /qr/*
│   ├── notifications.py     ← /notifications/*
│   ├── gamification.py      ← /xp, /badges, /scoreboard
│   ├── posts.py             ← /posts/*
│   ├── admin.py             ← /admin/*
│   └── search.py            ← /search/*
│
├── models/
│   ├── user.py
│   ├── event.py
│   ├── organization.py
│   └── ...                  ← Pydantic models per domain
│
├── middleware/
│   ├── auth.py              ← JWT validation, role extraction
│   └── ratelimit.py
│
└── utils/
    ├── qr_generator.py      ← QR token generation/validation
    ├── pdf_generator.py     ← Passport + certificate PDFs
    └── xp_engine.py         ← XP calculation logic
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🗄️ DATABASE SCHEMA
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> Run these SQL statements in Supabase SQL Editor in order.
> Enable PostGIS first: `CREATE EXTENSION IF NOT EXISTS postgis;`

---

### TABLE: profiles
> Extends Supabase auth.users. One row per user account.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  player_number   SERIAL UNIQUE,              -- #4821
  username        TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  avatar_url      TEXT,                       -- Supabase Storage URL
  shape           TEXT CHECK (shape IN ('circle','triangle','square','diamond')),
  shape_color     TEXT,                       -- hex color
  bio             TEXT,
  wilaya          TEXT,
  city            TEXT,
  location        GEOGRAPHY(POINT, 4326),     -- PostGIS for geo queries
  is_student      BOOLEAN DEFAULT FALSE,
  university      TEXT,
  study_year      TEXT,
  role            TEXT NOT NULL DEFAULT 'participant'
                  CHECK (role IN ('participant','organizer','recruiter','local_admin','global_admin')),
  xp              INTEGER NOT NULL DEFAULT 0,
  level           INTEGER NOT NULL DEFAULT 1,
  onboarding_done BOOLEAN DEFAULT FALSE,
  volunteer_available BOOLEAN DEFAULT TRUE,
  stealth_mode    BOOLEAN DEFAULT FALSE,
  visibility      TEXT DEFAULT 'public'
                  CHECK (visibility IN ('public','followers','private')),
  show_in_talent_pool BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile row when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'player_' || floor(random()*99999)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### TABLE: organizations

```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,       -- for /org/:slug URLs
  org_type        TEXT NOT NULL
                  CHECK (org_type IN ('university_club','student_association','ngo',
                                      'sports_club','company','government','other')),
  official_email  TEXT NOT NULL,
  registration_number TEXT,
  website         TEXT,
  description     TEXT,
  logo_url        TEXT,
  cover_url       TEXT,
  document_url    TEXT,                       -- uploaded verification doc
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','under_review','approved','rejected')),
  rejection_reason TEXT,
  verified        BOOLEAN DEFAULT FALSE,      -- blue checkmark
  follower_count  INTEGER DEFAULT 0,
  event_count     INTEGER DEFAULT 0,
  total_attendees INTEGER DEFAULT 0,
  wilaya          TEXT,
  city            TEXT,
  location        GEOGRAPHY(POINT, 4326),
  founded_year    INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: org members (multiple people can manage one org)
CREATE TABLE org_members (
  org_id    UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Junction: org followers
CREATE TABLE org_followers (
  org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);
```

---

### TABLE: events

```sql
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  created_by      UUID NOT NULL REFERENCES profiles(id),

  -- Core
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE,
  description     TEXT,
  event_type      TEXT NOT NULL
                  CHECK (event_type IN ('sport','science','charity','cultural')),
  status          TEXT DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','live','completed','cancelled')),
  visibility      TEXT DEFAULT 'open'
                  CHECK (visibility IN ('open','invite_only','private')),

  -- Dates
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  registration_closes_at TIMESTAMPTZ,

  -- Location
  venue_name      TEXT,
  address         TEXT,
  wilaya          TEXT,
  city            TEXT,
  location        GEOGRAPHY(POINT, 4326),     -- PostGIS
  is_online       BOOLEAN DEFAULT FALSE,
  online_url      TEXT,
  is_international BOOLEAN DEFAULT FALSE,

  -- Capacity
  capacity        INTEGER,                    -- NULL = unlimited
  waitlist_enabled BOOLEAN DEFAULT FALSE,
  team_mode       BOOLEAN DEFAULT FALSE,
  is_paid         BOOLEAN DEFAULT FALSE,

  -- Media
  cover_url       TEXT,
  media_urls      TEXT[] DEFAULT '{}',

  -- Skills tags
  tags            TEXT[] DEFAULT '{}',

  -- Gamification
  xp_checkin      INTEGER DEFAULT 100,
  xp_completion   INTEGER DEFAULT 200,
  xp_winner       INTEGER DEFAULT 0,
  xp_volunteer_multiplier BOOLEAN DEFAULT TRUE,

  -- Counters (denormalized for performance)
  registration_count INTEGER DEFAULT 0,
  checkin_count      INTEGER DEFAULT 0,
  view_count         INTEGER DEFAULT 0,

  -- Fundraising (charity)
  fundraising_goal    BIGINT,
  fundraising_current BIGINT DEFAULT 0,

  -- Scheduling
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX events_location_idx ON events USING GIST (location);
CREATE INDEX events_status_idx ON events (status);
CREATE INDEX events_starts_at_idx ON events (starts_at);
CREATE INDEX events_org_idx ON events (org_id);
```

---

### TABLE: event_type_details
> Stores type-specific fields that vary per event type.

```sql
-- SPORT
CREATE TABLE event_sport_details (
  event_id        UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  team_a_name     TEXT,
  team_b_name     TEXT,
  team_a_score    INTEGER,
  team_b_score    INTEGER,
  league_name     TEXT,
  live_score_enabled BOOLEAN DEFAULT FALSE
);

-- SCIENCE
CREATE TABLE event_science_details (
  event_id            UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  call_for_papers     BOOLEAN DEFAULT FALSE,
  submission_deadline TIMESTAMPTZ,
  abstract_word_limit INTEGER,
  accept_pdf_uploads  BOOLEAN DEFAULT TRUE,
  topics              TEXT[] DEFAULT '{}',
  pub_language        TEXT DEFAULT 'en'
);

CREATE TABLE event_speakers (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  title     TEXT,
  org_name  TEXT,
  topic     TEXT,
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE event_doi_links (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label     TEXT,
  url       TEXT NOT NULL
);

-- CHARITY
CREATE TABLE event_charity_details (
  event_id        UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  ngo_cert_number TEXT,
  show_live_progress BOOLEAN DEFAULT TRUE,
  currency        TEXT DEFAULT 'DZD'
);

-- CULTURAL
CREATE TABLE event_cultural_details (
  event_id            UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  require_age_verify  BOOLEAN DEFAULT FALSE
);

CREATE TABLE event_performers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  stage_name  TEXT,
  time_slot   TEXT,
  role        TEXT,
  photo_url   TEXT,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE event_ticket_tiers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                  -- STANDARD / VIP / VVIP
  tier_shape  TEXT,                           -- square / triangle / circle
  price       BIGINT NOT NULL DEFAULT 0,
  perks       TEXT,
  quantity    INTEGER,
  sold        INTEGER DEFAULT 0,
  sort_order  INTEGER DEFAULT 0
);
```

---

### TABLE: event_registrations

```sql
CREATE TABLE event_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'confirmed'
              CHECK (status IN ('pending_approval','confirmed','waitlisted','cancelled')),
  ticket_tier_id UUID REFERENCES event_ticket_tiers(id),
  checked_in  BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  xp_awarded  BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX registrations_event_idx ON event_registrations (event_id);
CREATE INDEX registrations_user_idx ON event_registrations (user_id);
```

---

### TABLE: volunteer_roles + applications

```sql
CREATE TABLE volunteer_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slots       INTEGER NOT NULL DEFAULT 1,
  filled      INTEGER DEFAULT 0,
  skills      TEXT[] DEFAULT '{}',
  perks       TEXT,
  shift_start TIMESTAMPTZ,
  shift_end   TIMESTAMPTZ,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE volunteer_applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id     UUID NOT NULL REFERENCES volunteer_roles(id) ON DELETE CASCADE,
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','approved','rejected')),
  applied_at  TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  UNIQUE (role_id, user_id)
);
```

---

### TABLE: teams

```sql
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,           -- e.g. T-4821
  leader_id   UUID NOT NULL REFERENCES profiles(id),
  shape       TEXT,
  color       TEXT,
  max_members INTEGER DEFAULT 5,
  is_public   BOOLEAN DEFAULT TRUE,
  is_ready    BOOLEAN DEFAULT FALSE,
  skills_needed TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id   UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT,                             -- BACKEND / FRONTEND / ML / DESIGN / PM
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
```

---

### TABLE: chat channels + messages

```sql
CREATE TABLE chat_channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                  -- general / team-formation / announcements / staff-only
  channel_type TEXT DEFAULT 'event'
              CHECK (channel_type IN ('event','dm','travel','team')),
  shape       TEXT,
  is_locked   BOOLEAN DEFAULT FALSE,          -- staff-only: locked for non-volunteers
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id),
  content     TEXT,
  msg_type    TEXT DEFAULT 'text'
              CHECK (msg_type IN ('text','image','file','poll','announcement','system','voice')),
  file_url    TEXT,
  file_name   TEXT,
  file_size   INTEGER,
  is_broadcast BOOLEAN DEFAULT FALSE,         -- flash alert
  edited_at   TIMESTAMPTZ,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_channel_idx ON messages (channel_id, created_at DESC);

CREATE TABLE message_reactions (
  message_id  UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE TABLE polls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL,                 -- [{id, text}]
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE poll_votes (
  poll_id     UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  option_id   TEXT NOT NULL,
  voted_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (poll_id, user_id)
);
```

---

### TABLE: stories

```sql
CREATE TABLE stories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES events(id),     -- optional link
  audience    TEXT DEFAULT 'followers'
              CHECK (audience IN ('followers','event_registrants','staff')),
  pinned_to_event BOOLEAN DEFAULT FALSE,
  expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  view_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE story_frames (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  media_url   TEXT NOT NULL,
  media_type  TEXT CHECK (media_type IN ('image','video')),
  duration_ms INTEGER DEFAULT 5000,
  overlays    JSONB DEFAULT '[]',             -- text, stickers, CTAs, polls, countdowns
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE story_views (
  story_id    UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (story_id, user_id)
);
```

---

### TABLE: notifications

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN (
                'event_update','registration_confirmed','event_starts_soon',
                'friend_registered','new_follower','connection_request',
                'volunteer_approved','volunteer_rejected',
                'badge_earned','xp_gained','level_up',
                'golden_ticket','flash_alert','org_verified','org_rejected',
                'new_message','new_dm'
              )),
  title       TEXT,
  body        TEXT NOT NULL,
  data        JSONB DEFAULT '{}',             -- extra context (event_id, org_id, etc.)
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC);
```

---

### TABLE: gamification

```sql
CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url    TEXT,
  shape       TEXT,
  color       TEXT,
  xp_value    INTEGER DEFAULT 0,
  criteria    JSONB,                          -- machine-readable unlock conditions
  is_custom   BOOLEAN DEFAULT FALSE,
  event_id    UUID REFERENCES events(id),     -- NULL = platform badge, set = event badge
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id    UUID REFERENCES badges(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES events(id),
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE xp_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,               -- positive = earn, negative = spend
  reason      TEXT NOT NULL,                  -- 'checkin', 'completion', 'volunteer', etc.
  event_id    UUID REFERENCES events(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX xp_user_idx ON xp_transactions (user_id, created_at DESC);
```

---

### TABLE: skills

```sql
CREATE TABLE skills (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('tech','social','leadership','other'))
);

CREATE TABLE user_skills (
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id    UUID REFERENCES skills(id) ON DELETE CASCADE,
  verified    BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,                           -- 'event_attendance', 'org_endorsement'
  PRIMARY KEY (user_id, skill_id)
);
```

---

### TABLE: connections (social graph)

```sql
CREATE TABLE connections (
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','accepted','declined','blocked')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (requester_id, addressee_id)
);
```

---

### TABLE: certificates

```sql
CREATE TABLE certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  event_id        UUID NOT NULL REFERENCES events(id),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  role            TEXT,                       -- participant / volunteer / speaker
  pdf_url         TEXT,
  verification_code TEXT UNIQUE NOT NULL DEFAULT 'CERT-' || upper(substring(gen_random_uuid()::text, 1, 12)),
  issued_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

### TABLE: QR tokens

```sql
CREATE TABLE qr_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id),
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,           -- 60s from creation
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX qr_tokens_event_idx ON qr_tokens (event_id, expires_at);

-- Auto-delete expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_qr_tokens()
RETURNS void AS $$
  DELETE FROM qr_tokens WHERE expires_at < NOW();
$$ LANGUAGE sql;
```

---

### TABLE: posts (org announcements/updates)

```sql
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id),
  post_type   TEXT DEFAULT 'update'
              CHECK (post_type IN ('update','announcement')),
  content     TEXT,
  media_urls  TEXT[] DEFAULT '{}',
  is_draft    BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  like_count  INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### TABLE: sponsorships

```sql
CREATE TABLE sponsorships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id),  -- sponsor org
  tier        TEXT CHECK (tier IN ('bronze','silver','gold')),
  amount      BIGINT,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','active','completed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### TABLE: golden tickets (recruiter)

```sql
CREATE TABLE golden_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id    UUID NOT NULL REFERENCES profiles(id),
  candidate_id    UUID NOT NULL REFERENCES profiles(id),
  company_name    TEXT NOT NULL,
  message         TEXT,
  status          TEXT DEFAULT 'sent'
                  CHECK (status IN ('sent','accepted','declined','expired')),
  expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔐 ROW LEVEL SECURITY (RLS) POLICIES
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> Run in Supabase SQL Editor after creating tables.

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- PROFILES: public read, own write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ORGANIZATIONS: public read approved orgs, owner writes
CREATE POLICY "orgs_public_read" ON organizations FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid());
CREATE POLICY "orgs_owner_update" ON organizations FOR UPDATE
  USING (owner_id = auth.uid());
CREATE POLICY "orgs_insert_auth" ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- EVENTS: public read live/completed, org writes own
CREATE POLICY "events_public_read" ON events FOR SELECT
  USING (status IN ('live','completed','scheduled') OR created_by = auth.uid());
CREATE POLICY "events_org_insert" ON events FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM org_members WHERE org_id = events.org_id AND user_id = auth.uid())
  );
CREATE POLICY "events_org_update" ON events FOR UPDATE
  USING (created_by = auth.uid());

-- REGISTRATIONS: user reads own, org reads for their events
CREATE POLICY "registrations_own_read" ON event_registrations FOR SELECT
  USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.created_by = auth.uid())
  );
CREATE POLICY "registrations_own_insert" ON event_registrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- MESSAGES: participants of channel can read and write
CREATE POLICY "messages_channel_read" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_channels cc
      JOIN event_registrations er ON er.event_id = cc.event_id
      WHERE cc.id = channel_id AND er.user_id = auth.uid()
    )
  );
CREATE POLICY "messages_own_insert" ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- NOTIFICATIONS: own only
CREATE POLICY "notifications_own" ON notifications FOR ALL
  USING (user_id = auth.uid());

-- QR TOKENS: org generates, authenticated users read valid tokens
CREATE POLICY "qr_tokens_org_insert" ON qr_tokens FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.created_by = auth.uid())
  );
CREATE POLICY "qr_tokens_auth_read" ON qr_tokens FOR SELECT
  USING (auth.uid() IS NOT NULL AND expires_at > NOW());

-- CERTIFICATES: public read (for /verify/:id), own full access
CREATE POLICY "certs_public_read" ON certificates FOR SELECT USING (true);

-- CONNECTIONS: own rows
CREATE POLICY "connections_own" ON connections FOR ALL
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📡 SUPABASE REALTIME CHANNELS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> Configure in Supabase Dashboard → Realtime, then subscribe in frontend.

```
CHANNEL: chat:{channelId}
  TABLE:  messages
  FILTER: channel_id=eq.{channelId}
  EVENTS: INSERT
  USE:    Live chat messages in Chat.jsx

CHANNEL: checkins:{eventId}
  TABLE:  event_registrations
  FILTER: event_id=eq.{eventId} AND checked_in=eq.true
  EVENTS: UPDATE
  USE:    Command center live check-in feed

CHANNEL: event_counter:{eventId}
  TABLE:  events
  FILTER: id=eq.{eventId}
  EVENTS: UPDATE (registration_count, checkin_count)
  USE:    Live capacity bar on EventDetail

CHANNEL: org_status:{orgId}
  TABLE:  organizations
  FILTER: id=eq.{orgId}
  EVENTS: UPDATE (status)
  USE:    OrgRegisterAuth.jsx pending state → auto-redirect on approval

CHANNEL: notifications:{userId}
  TABLE:  notifications
  FILTER: user_id=eq.{userId}
  EVENTS: INSERT
  USE:    Real-time notification bell badge update

CHANNEL: volunteer_status:{userId}:{eventId}
  TABLE:  volunteer_applications
  FILTER: user_id=eq.{userId} AND event_id=eq.{eventId}
  EVENTS: UPDATE (status)
  USE:    Notify volunteer of approval/rejection

CHANNEL: qr_checkin:{eventId}
  TABLE:  event_registrations
  FILTER: event_id=eq.{eventId} AND checked_in=eq.true
  EVENTS: UPDATE
  USE:    QREntry.jsx live feed of who scanned
```

### Frontend subscription example (React):
```javascript
// In QREntry.jsx (org generate mode)
import { supabase } from '../lib/supabase'

useEffect(() => {
  const channel = supabase
    .channel(`qr_checkin:${eventId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'event_registrations',
      filter: `event_id=eq.${eventId}`,
    }, (payload) => {
      if (payload.new.checked_in) {
        setCheckinFeed(prev => [payload.new, ...prev].slice(0, 20))
        setCheckinCount(prev => prev + 1)
      }
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [eventId])
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📦 SUPABASE STORAGE BUCKETS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> Create in Supabase Dashboard → Storage.

| Bucket | Public | Max Size | Allowed Types | Used By |
|--------|--------|----------|---------------|---------|
| `avatars` | ✅ Public | 5MB | image/* | User avatars |
| `events` | ✅ Public | 50MB | image/*, video/* | Event covers, media gallery |
| `orgs` | ✅ Public | 50MB | image/*, application/pdf | Org logos, covers, verification docs |
| `stories` | ✅ Public | 50MB | image/*, video/* | Story frames |
| `posts` | ✅ Public | 50MB | image/*, video/*, application/pdf | Post attachments |
| `certificates` | ✅ Public | 5MB | application/pdf | Generated cert PDFs |
| `passports` | 🔒 Private | 5MB | application/pdf | Generated passport PDFs |
| `abstracts` | 🔒 Private | 20MB | application/pdf | Science event submissions |

### Storage path conventions:
```
avatars/          {userId}/avatar.webp
events/           {eventId}/cover.webp
                  {eventId}/gallery/{filename}
orgs/             {orgId}/logo.webp
                  {orgId}/cover.webp
                  {orgId}/docs/{filename}
stories/          {orgId}/{storyId}/{frameId}.webp
certificates/     {userId}/{eventId}/cert.pdf
passports/        {userId}/passport.pdf
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔌 FASTAPI BACKEND — ALL ENDPOINTS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> Base URL: `https://api.eventfy.app/v1`
> All protected routes require: `Authorization: Bearer {supabase_jwt}`

---

### AUTH  `/auth`

```
POST   /auth/register/participant   Create participant account
POST   /auth/register/org           Create org account (sets status=pending)
POST   /auth/login                  Not needed — Supabase handles login
POST   /auth/logout                 Revoke session
GET    /auth/me                     Get current user + profile
PATCH  /auth/me                     Update profile fields
POST   /auth/complete-onboarding    Set onboarding_done=true
```

---

### USERS  `/users`

```
GET    /users/{username}            Get public profile
GET    /users/{username}/passport   Get full passport data (events, badges, certs)
GET    /users/me/feed               Personalized event feed
GET    /users/me/events             My registered events
GET    /users/me/notifications      My notifications (paginated)
PATCH  /users/me/notifications/read Mark all notifications read
GET    /users/me/skills             My skills
POST   /users/me/skills             Add skill
DELETE /users/me/skills/{skillId}   Remove skill
GET    /users/me/connections        My connections
POST   /users/me/connections/{userId}  Send connection request
PATCH  /users/me/connections/{userId}  Accept/decline request
DELETE /users/me/connections/{userId}  Remove connection
GET    /users/me/xp                 XP history
POST   /users/me/avatar             Upload avatar → Supabase Storage
```

---

### EVENTS  `/events`

```
GET    /events                      List events (filter: type, wilaya, status, tags)
GET    /events/feed                 Smart feed (personalized, location-based)
GET    /events/trending             Trending events (last 7 days)
GET    /events/{id}                 Get event detail (full polymorphic data)
POST   /events                      Create event [OrgGuard]
PATCH  /events/{id}                 Update event [OrgGuard]
DELETE /events/{id}                 Delete/cancel event [OrgGuard]
POST   /events/{id}/publish         Publish event [OrgGuard]
POST   /events/{id}/schedule        Schedule publish [OrgGuard]

POST   /events/{id}/register        Register for event
DELETE /events/{id}/register        Unregister
GET    /events/{id}/registrations   Get registrations [OrgGuard]

GET    /events/{id}/volunteers      Get volunteer roles + slots
POST   /events/{id}/volunteers/apply Apply for volunteer role
PATCH  /events/{id}/volunteers/{appId}  Approve/reject application [OrgGuard]

GET    /events/{id}/teams           Get teams for this event
POST   /events/{id}/teams           Create team
POST   /events/{id}/teams/{teamId}/join  Join team
DELETE /events/{id}/teams/{teamId}/leave Leave team
PATCH  /events/{id}/teams/{teamId}/ready Mark team ready [team leader]

GET    /events/{id}/stats           Event stats (command center) [OrgGuard]
GET    /events/{id}/checkins        Live check-in list [OrgGuard]
POST   /events/{id}/broadcast       Send flash alert to all registrants [OrgGuard]
```

---

### QR  `/qr`

```
POST   /qr/{eventId}/generate       Generate new QR token (60s TTL) [OrgGuard]
                                    Returns: { token, expires_at, qr_data_url }
POST   /qr/{eventId}/scan           Validate token + check in user [AuthGuard]
                                    Body: { token }
                                    Returns: { success, user, xp_earned, badge_unlocked }
```

---

### ORGANIZATIONS  `/orgs`

```
GET    /orgs                        List approved orgs (filter: type, wilaya)
GET    /orgs/{slug}                 Get org profile
POST   /orgs                        Create org (status=pending)
PATCH  /orgs/{id}                   Update org [OrgGuard]
POST   /orgs/{id}/logo              Upload logo [OrgGuard]
POST   /orgs/{id}/cover             Upload cover [OrgGuard]

POST   /orgs/{id}/follow            Follow org
DELETE /orgs/{id}/follow            Unfollow
GET    /orgs/{id}/followers         Get followers

GET    /orgs/{id}/events            Get org's events
GET    /orgs/{id}/posts             Get org's posts

POST   /orgs/{id}/members           Add member [OrgGuard]
DELETE /orgs/{id}/members/{userId}  Remove member [OrgGuard]
```

---

### CHAT  `/chat`

```
GET    /chat/channels/{eventId}     Get channels for an event (user must be registered)
GET    /chat/channels/{channelId}/messages  Get message history (paginated, newest last)
POST   /chat/channels/{channelId}/messages  Send message
PATCH  /chat/messages/{messageId}   Edit message (own only)
DELETE /chat/messages/{messageId}   Delete message (own or org)
POST   /chat/messages/{messageId}/react  Add reaction

POST   /chat/dm/{userId}            Start or get DM channel
GET    /chat/dm                     List all DM conversations
```

---

### STORIES  `/stories`

```
GET    /stories/feed                Stories from followed orgs
GET    /stories/{storyId}           Get story frames
POST   /stories                     Create story [OrgGuard]
POST   /stories/{storyId}/frames    Add frame [OrgGuard]
DELETE /stories/{storyId}           Delete story [OrgGuard]
POST   /stories/{storyId}/view      Record view
GET    /stories/{storyId}/analytics Views/reactions breakdown [OrgGuard]
```

---

### POSTS  `/posts`

```
GET    /posts/feed                  Posts from followed orgs
GET    /posts/{postId}              Get post detail
POST   /posts                       Create post [OrgGuard]
PATCH  /posts/{postId}              Edit post [OrgGuard]
DELETE /posts/{postId}              Delete post [OrgGuard]
POST   /posts/{postId}/like         Like/unlike
POST   /posts/{postId}/comment      Comment
```

---

### GAMIFICATION  `/gamification`

```
GET    /gamification/scoreboard     Global leaderboard (paginated)
GET    /gamification/badges         All platform badges
GET    /gamification/badges/{userId}  User's earned badges
POST   /gamification/xp             Award XP [internal/OrgGuard]
GET    /gamification/level/{xp}     Get level for XP amount
```

---

### SEARCH  `/search`

```
GET    /search?q={query}&type={events|orgs|users}&...filters
       Filters: event_type, wilaya, tags, date_from, date_to, free, near_me
       Returns: { events[], orgs[], users[] }

GET    /search/skills?q={query}     Autocomplete skills
GET    /search/events/nearby?lat={}&lng={}&radius={}  PostGIS geo query
```

---

### ADMIN  `/admin`

```
GET    /admin/orgs/pending          Verification queue
PATCH  /admin/orgs/{id}/approve     Approve org + send notification
PATCH  /admin/orgs/{id}/reject      Reject org + send notification + reason
PATCH  /admin/orgs/{id}/review      Mark under review

GET    /admin/users                 User list (filter: role, status, region)
PATCH  /admin/users/{id}/suspend    Suspend user
PATCH  /admin/users/{id}/ban        Ban user
PATCH  /admin/users/{id}/promote    Promote to local_admin or global_admin

GET    /admin/flags                 Content flag queue
PATCH  /admin/flags/{id}/resolve    Resolve flag (dismiss/delete/escalate)

GET    /admin/stats                 Platform analytics
GET    /admin/health                System health metrics
```

---

### CERTIFICATES  `/certificates`

```
GET    /certificates/{code}         Verify certificate (PUBLIC — no auth)
POST   /certificates/generate/{eventId}  Generate + issue cert for user
GET    /certificates/me             My certificates
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚙️ XP ENGINE LOGIC
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```python
# utils/xp_engine.py

LEVEL_THRESHOLDS = [
    0,      # Level 1
    500,    # Level 2
    1200,   # Level 3
    2500,   # Level 4
    4500,   # Level 5
    7000,   # Level 6
    10000,  # Level 7
    14000,  # Level 8
    19000,  # Level 9
    25000,  # Level 10
]

LEVEL_TITLES = {
    1: "ROOKIE",
    2: "CHALLENGER",
    3: "ARENA PLAYER",
    4: "RISING STAR",
    5: "TACTICIAN",
    6: "VETERAN",
    7: "HACKATHON VETERAN",
    8: "ELITE OPERATOR",
    9: "LEGEND",
    10: "THE FRONT MAN",
}

def get_level(xp: int) -> int:
    for i, threshold in enumerate(reversed(LEVEL_THRESHOLDS)):
        if xp >= threshold:
            return len(LEVEL_THRESHOLDS) - i
    return 1

def award_xp(user_id: str, amount: int, reason: str, event_id: str = None):
    # 1. Insert xp_transaction
    # 2. Update profiles.xp += amount
    # 3. Check if level changed → if yes, insert notification (level_up)
    # 4. Check badge criteria → if any unlocked, award badge + notification
    # 5. Return { new_xp, new_level, leveled_up, badges_unlocked }
```

### XP Award triggers:
| Action | XP | Notes |
|--------|-----|-------|
| QR check-in | event.xp_checkin (default 100) | Awarded on scan |
| Event completion | event.xp_completion (default 200) | Awarded 24h after event ends |
| Volunteer shift | xp_checkin × 3 | If xp_volunteer_multiplier is true |
| Register first event | +50 | One-time |
| Complete onboarding | +100 | One-time |
| Earn first badge | +200 | One-time |
| Create event (org) | +500 | Per event launched |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🖥️ FRONTEND — HOW TO WIRE SUPABASE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1. Install and configure:
```bash
npm install @supabase/supabase-js
```

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

```env
# .env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/v1
```

---

### 2. Auth context (wrap AppRouter):
```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

### 3. Route guards using auth context:
```javascript
// src/router/guards/AuthGuard.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AuthGuard({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="loading-screen" />
  if (!user) return <Navigate to="/splash" replace />
  if (user && profile && !profile.onboarding_done)
    return <Navigate to="/onboarding/1" replace />
  return children
}

export function GuestGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen" />
  if (user) return <Navigate to="/feed" replace />
  return children
}

export function OrgGuard({ children }) {
  const { profile, loading } = useAuth()
  if (loading) return <div className="loading-screen" />
  if (!profile || profile.role !== 'organizer')
    return <Navigate to="/feed" replace />
  return children
}
```

---

### 4. API call helper:
```javascript
// src/lib/api.js
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL

export async function api(method, path, body = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Request failed')
  }

  return res.json()
}

// Usage:
// const feed = await api('GET', '/events/feed?wilaya=Bejaia')
// const event = await api('POST', '/events', { title: '...', ... })
```

---

### 5. Feed.jsx — what needs to change:

```javascript
// BEFORE (static hardcoded data):
const events = [
  { id: 1, title: "Hackathon 2026", type: "sport", ... }
]

// AFTER (real data from Supabase):
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Feed() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [toggle, setToggle] = useState('local')      // local | national | international
  const [loading, setLoading] = useState(true)
  const [registeredIds, setRegisteredIds] = useState(new Set())

  useEffect(() => {
    loadFeed()
  }, [toggle])

  async function loadFeed() {
    setLoading(true)
    const data = await api('GET', `/events/feed?scope=${toggle}`)
    setEvents(data.events)
    setRegisteredIds(new Set(data.registered_event_ids))
    setLoading(false)
  }

  async function handleRegister(eventId) {
    // Optimistic UI
    setRegisteredIds(prev => new Set([...prev, eventId]))
    try {
      await api('POST', `/events/${eventId}/register`)
    } catch {
      // Rollback
      setRegisteredIds(prev => { prev.delete(eventId); return new Set(prev) })
    }
  }

  // All onClick handlers use navigate(...)
  // All buttons check registeredIds.has(event.id) for state
}
```

---

### 6. EventDetail.jsx — polymorphic rendering:

```javascript
import SportSection from './sections/SportSection'
import ScienceSection from './sections/ScienceSection'
import CharitySection from './sections/CharitySection'
import CulturalSection from './sections/CulturalSection'

// In INFO tab render:
{event.event_type === 'sport' && <SportSection event={event} />}
{event.event_type === 'science' && <ScienceSection event={event} />}
{event.event_type === 'charity' && <CharitySection event={event} />}
{event.event_type === 'cultural' && <CulturalSection event={event} />}
```

---

### 7. Chat.jsx — real-time messages:

```javascript
import { supabase } from '../../lib/supabase'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'

export default function Chat({ eventId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [channelId, setChannelId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    // 1. Load channel + message history
    api('GET', `/chat/channels/${eventId}`).then(data => {
      setChannelId(data.general_channel_id)
      setMessages(data.messages)
    })
  }, [eventId])

  useEffect(() => {
    if (!channelId) return
    // 2. Subscribe to realtime new messages
    const channel = supabase
      .channel(`chat:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new])
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [channelId])

  async function handleSend() {
    if (!input.trim()) return
    const text = input
    setInput('')   // clear immediately
    await api('POST', `/chat/channels/${channelId}/messages`, { content: text })
    // Realtime will add it to messages array automatically
  }

  return (
    // ... existing design ...
    // Send button onClick={handleSend}
    // input onChange={e => setInput(e.target.value)}
    // onKeyDown: Enter → handleSend
  )
}
```

---

### 8. QREntry.jsx — mode detection:

```javascript
import { useAuth } from '../../context/AuthContext'
import { useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Html5QrcodeScanner } from 'html5-qrcode'  // npm install html5-qrcode

export default function QREntry() {
  const { eventId } = useParams()
  const { profile } = useAuth()
  const isOrg = profile?.role === 'organizer'

  return isOrg
    ? <QRGenerateMode eventId={eventId} />
    : <QRScanMode eventId={eventId} />
}

function QRGenerateMode({ eventId }) {
  const [qrToken, setQrToken] = useState(null)
  const [checkinFeed, setCheckinFeed] = useState([])

  // Generate token on mount, refresh every 55s
  useEffect(() => {
    generateToken()
    const interval = setInterval(generateToken, 55000)
    return () => clearInterval(interval)
  }, [])

  async function generateToken() {
    const data = await api('POST', `/qr/${eventId}/generate`)
    setQrToken(data)  // { token, qr_data_url, expires_at }
  }

  // Subscribe to realtime check-ins
  useEffect(() => {
    const channel = supabase.channel(`qr_checkin:${eventId}`)
      .on('postgres_changes', { event: 'UPDATE', table: 'event_registrations',
          filter: `event_id=eq.${eventId}` },
        payload => {
          if (payload.new.checked_in) setCheckinFeed(p => [payload.new, ...p].slice(0, 20))
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [eventId])

  return (
    // ... existing QR display design ...
    // <img src={qrToken?.qr_data_url} /> replaces static QR
    // checkinFeed.map → live feed list
  )
}

function QRScanMode({ eventId }) {
  const [scanResult, setScanResult] = useState(null) // null | 'success' | 'already' | 'error'

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 })
    scanner.render(async (token) => {
      scanner.clear()
      try {
        const result = await api('POST', `/qr/${eventId}/scan`, { token })
        setScanResult({ status: 'success', ...result })
      } catch (e) {
        setScanResult({ status: e.message.includes('already') ? 'already' : 'error' })
      }
    }, () => {})
    return () => scanner.clear()
  }, [])

  // ... existing design with scanResult overlay ...
}
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🐍 FASTAPI — SETUP + KEY ROUTES
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Installation:
```bash
pip install fastapi uvicorn supabase python-jose[cryptography] \
            python-multipart Pillow qrcode[pil] reportlab httpx
```

### main.py:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, events, organizations, qr, chat, \
                    stories, gamification, admin, search, posts

app = FastAPI(title="Eventfy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://eventfy.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/v1/users", tags=["users"])
app.include_router(events.router, prefix="/v1/events", tags=["events"])
app.include_router(organizations.router, prefix="/v1/orgs", tags=["orgs"])
app.include_router(qr.router, prefix="/v1/qr", tags=["qr"])
app.include_router(chat.router, prefix="/v1/chat", tags=["chat"])
app.include_router(stories.router, prefix="/v1/stories", tags=["stories"])
app.include_router(gamification.router, prefix="/v1/gamification", tags=["gamification"])
app.include_router(admin.router, prefix="/v1/admin", tags=["admin"])
app.include_router(search.router, prefix="/v1/search", tags=["search"])
app.include_router(posts.router, prefix="/v1/posts", tags=["posts"])
```

### config.py:
```python
import os
from supabase import create_client, Client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]  # service_role key (never expose to frontend)
JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
```

### middleware/auth.py:
```python
from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError
from config import JWT_SECRET, supabase

async def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"],
                             options={"verify_aud": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        profile = supabase.table("profiles")\
                          .select("*")\
                          .eq("id", user_id)\
                          .single()\
                          .execute()
        return profile.data
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def require_org(user = Depends(get_current_user)):
    if user["role"] != "organizer":
        raise HTTPException(status_code=403, detail="Organization account required")
    return user

def require_admin(user = Depends(get_current_user)):
    if user["role"] not in ("local_admin", "global_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
```

### routers/qr.py (key logic):
```python
import secrets
import qrcode
import io
import base64
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user, require_org
from config import supabase
from utils.xp_engine import award_xp

router = APIRouter()

@router.post("/{event_id}/generate")
async def generate_qr(event_id: str, org = Depends(require_org)):
    # Verify org owns this event
    event = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if event.data["created_by"] != org["id"]:
        raise HTTPException(403, "Not your event")

    # Generate secure token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(seconds=60)

    supabase.table("qr_tokens").insert({
        "event_id": event_id,
        "org_id": org["id"],
        "token": token,
        "expires_at": expires_at.isoformat(),
    }).execute()

    # Generate QR image as base64
    qr_data = f"eventfy://checkin/{event_id}/{token}"
    img = qrcode.make(qr_data)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_b64 = base64.b64encode(buffer.getvalue()).decode()

    return {
        "token": token,
        "expires_at": expires_at.isoformat(),
        "qr_data_url": f"data:image/png;base64,{qr_b64}"
    }

@router.post("/{event_id}/scan")
async def scan_qr(event_id: str, body: dict, user = Depends(get_current_user)):
    token = body.get("token")

    # Validate token exists and not expired
    qr = supabase.table("qr_tokens")\
        .select("*")\
        .eq("event_id", event_id)\
        .eq("token", token)\
        .gt("expires_at", datetime.utcnow().isoformat())\
        .single()\
        .execute()

    if not qr.data:
        raise HTTPException(400, "Invalid or expired QR code")

    # Check registration
    reg = supabase.table("event_registrations")\
        .select("*")\
        .eq("event_id", event_id)\
        .eq("user_id", user["id"])\
        .single()\
        .execute()

    if not reg.data:
        raise HTTPException(403, "Not registered for this event")

    if reg.data["checked_in"]:
        raise HTTPException(409, "Already checked in")

    # Mark checked in
    supabase.table("event_registrations").update({
        "checked_in": True,
        "checked_in_at": datetime.utcnow().isoformat()
    }).eq("id", reg.data["id"]).execute()

    # Award XP
    event = supabase.table("events").select("xp_checkin").eq("id", event_id).single().execute()
    xp_result = award_xp(user["id"], event.data["xp_checkin"], "checkin", event_id)

    # Update event counter
    supabase.rpc("increment", {"table": "events", "id": event_id,
                                "col": "checkin_count"}).execute()

    return {
        "success": True,
        "user": { "player_number": user["player_number"], "full_name": user["full_name"] },
        "xp_earned": event.data["xp_checkin"],
        "new_total_xp": xp_result["new_xp"],
        "leveled_up": xp_result["leveled_up"],
        "badge_unlocked": xp_result.get("badge_unlocked"),
    }
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🚀 IMPLEMENTATION ORDER
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Follow this order to have a working app as fast as possible:

```
WEEK 1 — Foundation
  1. Create Supabase project
  2. Run all SQL schema migrations in order
  3. Enable RLS + create policies
  4. Create storage buckets
  5. Setup FastAPI project structure + config.py + middleware/auth.py
  6. Wire frontend: install @supabase/supabase-js, create AuthContext
  7. Fix auth screens (Splash, Login, Register) to call Supabase Auth
  8. Fix route guards to read from AuthContext

WEEK 2 — Core loop
  9.  Feed.jsx → real events from /events/feed
  10. EventDetail.jsx → real event data + polymorphic sections
  11. Register button → POST /events/:id/register
  12. BottomNav + all navigation fixes (the static-to-interactive pass)

WEEK 3 — Real-time
  13. Chat.jsx → real messages + Supabase Realtime subscription
  14. QREntry.jsx → generate mode (org) + scan mode (participant)
  15. Notifications → real from DB + realtime badge counter
  16. OrgRegisterAuth.jsx → WebSocket org approval auto-redirect

WEEK 4 — Gamification + Profiles
  17. XP Engine + award on check-in
  18. Badges + unlock on events
  19. PlayerProfile → real data
  20. Scoreboard → real leaderboard

WEEK 5 — Org tools
  21. CreateEvent → save to DB (all 4 types)
  22. CommandCenter → live stats + broadcast
  23. QRGenerator live check-in feed

WEEK 6 — Polish
  24. Search → full-text + geo
  25. Stories → creation + viewing
  26. Admin panel
  27. Certificate generation (PDF)
```

---

> **Give this entire file to Claude in Antigravity as context when working on any backend or frontend wiring task.**
> It contains the complete schema, all API contracts, all realtime channel definitions, and all frontend integration code needed to make the app fully dynamic.
