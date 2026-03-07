-- ================================================
-- EVENTFY DATABASE SCHEMA
-- Run in Supabase SQL Editor in order
-- ================================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── PROFILES ──────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  player_number   SERIAL UNIQUE,
  username        TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  avatar_url      TEXT,
  shape           TEXT CHECK (shape IN ('circle','triangle','square','diamond')),
  shape_color     TEXT,
  bio             TEXT,
  wilaya          TEXT,
  city            TEXT,
  location        GEOGRAPHY(POINT, 4326),
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

-- ── ORGANIZATIONS ─────────────────────────────
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  org_type        TEXT NOT NULL
                  CHECK (org_type IN ('university_club','student_association','ngo',
                                      'sports_club','company','government','other')),
  official_email  TEXT NOT NULL,
  registration_number TEXT,
  website         TEXT,
  description     TEXT,
  logo_url        TEXT,
  cover_url       TEXT,
  document_url    TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','under_review','approved','rejected')),
  rejection_reason TEXT,
  verified        BOOLEAN DEFAULT FALSE,
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

CREATE TABLE org_members (
  org_id    UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

CREATE TABLE org_followers (
  org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- ── EVENTS ────────────────────────────────────
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  created_by      UUID NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE,
  description     TEXT,
  event_type      TEXT NOT NULL CHECK (event_type IN ('sport','science','charity','cultural')),
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','live','completed','cancelled')),
  visibility      TEXT DEFAULT 'open' CHECK (visibility IN ('open','invite_only','private')),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  registration_closes_at TIMESTAMPTZ,
  venue_name      TEXT,
  address         TEXT,
  wilaya          TEXT,
  city            TEXT,
  location        GEOGRAPHY(POINT, 4326),
  is_online       BOOLEAN DEFAULT FALSE,
  online_url      TEXT,
  is_international BOOLEAN DEFAULT FALSE,
  capacity        INTEGER,
  waitlist_enabled BOOLEAN DEFAULT FALSE,
  team_mode       BOOLEAN DEFAULT FALSE,
  is_paid         BOOLEAN DEFAULT FALSE,
  cover_url       TEXT,
  media_urls      TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  xp_checkin      INTEGER DEFAULT 100,
  xp_completion   INTEGER DEFAULT 200,
  xp_winner       INTEGER DEFAULT 0,
  xp_volunteer_multiplier BOOLEAN DEFAULT TRUE,
  registration_count INTEGER DEFAULT 0,
  checkin_count      INTEGER DEFAULT 0,
  view_count         INTEGER DEFAULT 0,
  fundraising_goal    BIGINT,
  fundraising_current BIGINT DEFAULT 0,
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX events_location_idx ON events USING GIST (location);
CREATE INDEX events_status_idx ON events (status);
CREATE INDEX events_starts_at_idx ON events (starts_at);
CREATE INDEX events_org_idx ON events (org_id);

-- ── EVENT TYPE DETAILS ────────────────────────
CREATE TABLE event_sport_details (
  event_id        UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  team_a_name     TEXT, team_b_name TEXT,
  team_a_score    INTEGER, team_b_score INTEGER,
  league_name     TEXT, live_score_enabled BOOLEAN DEFAULT FALSE
);

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, title TEXT, org_name TEXT, topic TEXT,
  photo_url TEXT, sort_order INTEGER DEFAULT 0
);

CREATE TABLE event_doi_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label TEXT, url TEXT NOT NULL
);

CREATE TABLE event_charity_details (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  ngo_cert_number TEXT, show_live_progress BOOLEAN DEFAULT TRUE,
  currency TEXT DEFAULT 'DZD'
);

CREATE TABLE event_cultural_details (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  require_age_verify BOOLEAN DEFAULT FALSE
);

CREATE TABLE event_performers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, stage_name TEXT, time_slot TEXT,
  role TEXT, photo_url TEXT, sort_order INTEGER DEFAULT 0
);

CREATE TABLE event_ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, tier_shape TEXT,
  price BIGINT NOT NULL DEFAULT 0, perks TEXT,
  quantity INTEGER, sold INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- ── REGISTRATIONS ─────────────────────────────
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending_approval','confirmed','waitlisted','cancelled')),
  ticket_tier_id UUID REFERENCES event_ticket_tiers(id),
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  xp_awarded BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX registrations_event_idx ON event_registrations (event_id);
CREATE INDEX registrations_user_idx ON event_registrations (user_id);

-- ── VOLUNTEERS ────────────────────────────────
CREATE TABLE volunteer_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, slots INTEGER NOT NULL DEFAULT 1,
  filled INTEGER DEFAULT 0, skills TEXT[] DEFAULT '{}',
  perks TEXT, shift_start TIMESTAMPTZ, shift_end TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES volunteer_roles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  UNIQUE (role_id, user_id)
);

-- ── TEAMS ─────────────────────────────────────
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, code TEXT UNIQUE NOT NULL,
  leader_id UUID NOT NULL REFERENCES profiles(id),
  shape TEXT, color TEXT, max_members INTEGER DEFAULT 5,
  is_public BOOLEAN DEFAULT TRUE, is_ready BOOLEAN DEFAULT FALSE,
  skills_needed TEXT[] DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT, joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- ── CHAT ──────────────────────────────────────
CREATE TABLE chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel_type TEXT DEFAULT 'event' CHECK (channel_type IN ('event','dm','travel','team')),
  shape TEXT, is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT,
  msg_type TEXT DEFAULT 'text' CHECK (msg_type IN ('text','image','file','poll','announcement','system','voice')),
  file_url TEXT, file_name TEXT, file_size INTEGER,
  is_broadcast BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX messages_channel_idx ON messages (channel_id, created_at DESC);

CREATE TABLE message_reactions (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
  question TEXT NOT NULL, options JSONB NOT NULL,
  ends_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE poll_votes (
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL, voted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (poll_id, user_id)
);

-- ── STORIES ───────────────────────────────────
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  audience TEXT DEFAULT 'followers' CHECK (audience IN ('followers','event_registrants','staff')),
  pinned_to_event BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE story_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image','video')),
  duration_ms INTEGER DEFAULT 5000,
  overlays JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE story_views (
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (story_id, user_id)
);

-- ── NOTIFICATIONS ─────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'event_update','registration_confirmed','event_starts_soon',
    'friend_registered','new_follower','connection_request',
    'volunteer_approved','volunteer_rejected',
    'badge_earned','xp_gained','level_up',
    'golden_ticket','flash_alert','org_verified','org_rejected',
    'new_message','new_dm'
  )),
  title TEXT, body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC);

-- ── GAMIFICATION ──────────────────────────────
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, description TEXT,
  icon_url TEXT, shape TEXT, color TEXT,
  xp_value INTEGER DEFAULT 0,
  criteria JSONB,
  is_custom BOOLEAN DEFAULT FALSE,
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX xp_user_idx ON xp_transactions (user_id, created_at DESC);

-- ── SKILLS ────────────────────────────────────
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('tech','social','leadership','other'))
);

CREATE TABLE user_skills (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  PRIMARY KEY (user_id, skill_id)
);

-- ── CONNECTIONS ───────────────────────────────
CREATE TABLE connections (
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (requester_id, addressee_id)
);

-- ── CERTIFICATES ──────────────────────────────
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  event_id UUID NOT NULL REFERENCES events(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  role TEXT,
  pdf_url TEXT,
  verification_code TEXT UNIQUE NOT NULL DEFAULT 'CERT-' || upper(substring(gen_random_uuid()::text, 1, 12)),
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── QR TOKENS ─────────────────────────────────
CREATE TABLE qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX qr_tokens_event_idx ON qr_tokens (event_id, expires_at);

-- ── POSTS ─────────────────────────────────────
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  post_type TEXT DEFAULT 'update' CHECK (post_type IN ('update','announcement')),
  content TEXT, media_urls TEXT[] DEFAULT '{}',
  is_draft BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SPONSORSHIPS ──────────────────────────────
CREATE TABLE sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id),
  tier TEXT CHECK (tier IN ('bronze','silver','gold')),
  amount BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── GOLDEN TICKETS ────────────────────────────
CREATE TABLE golden_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id),
  candidate_id UUID NOT NULL REFERENCES profiles(id),
  company_name TEXT NOT NULL, message TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','accepted','declined','expired')),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
