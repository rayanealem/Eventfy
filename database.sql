-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon_url text,
  shape text,
  color text,
  xp_value integer DEFAULT 0,
  criteria jsonb,
  is_custom boolean DEFAULT false,
  event_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT badges_pkey PRIMARY KEY (id),
  CONSTRAINT badges_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  org_id uuid NOT NULL,
  role text,
  pdf_url text,
  verification_code text NOT NULL DEFAULT ('CERT-'::text || upper("substring"((gen_random_uuid())::text, 1, 12))) UNIQUE,
  issued_at timestamp with time zone DEFAULT now(),
  CONSTRAINT certificates_pkey PRIMARY KEY (id),
  CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT certificates_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT certificates_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.chat_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  name text NOT NULL,
  channel_type text DEFAULT 'event'::text CHECK (channel_type = ANY (ARRAY['event'::text, 'dm'::text, 'travel'::text, 'team'::text])),
  shape text,
  is_locked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_channels_pkey PRIMARY KEY (id),
  CONSTRAINT chat_channels_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.connections (
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'blocked'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT connections_pkey PRIMARY KEY (requester_id, addressee_id),
  CONSTRAINT connections_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id),
  CONSTRAINT connections_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.event_charity_details (
  event_id uuid NOT NULL,
  ngo_cert_number text,
  show_live_progress boolean DEFAULT true,
  currency text DEFAULT 'DZD'::text,
  CONSTRAINT event_charity_details_pkey PRIMARY KEY (event_id),
  CONSTRAINT event_charity_details_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT event_comments_pkey PRIMARY KEY (id),
  CONSTRAINT event_comments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.event_cultural_details (
  event_id uuid NOT NULL,
  require_age_verify boolean DEFAULT false,
  CONSTRAINT event_cultural_details_pkey PRIMARY KEY (event_id),
  CONSTRAINT event_cultural_details_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_doi_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  label text,
  url text NOT NULL,
  CONSTRAINT event_doi_links_pkey PRIMARY KEY (id),
  CONSTRAINT event_doi_links_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT event_likes_pkey PRIMARY KEY (id),
  CONSTRAINT event_likes_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.event_performers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  stage_name text,
  time_slot text,
  role text,
  photo_url text,
  sort_order integer DEFAULT 0,
  CONSTRAINT event_performers_pkey PRIMARY KEY (id),
  CONSTRAINT event_performers_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['pending_approval'::text, 'confirmed'::text, 'waitlisted'::text, 'cancelled'::text])),
  ticket_tier_id uuid,
  checked_in boolean DEFAULT false,
  checked_in_at timestamp with time zone,
  xp_awarded boolean DEFAULT false,
  registered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT event_registrations_ticket_tier_id_fkey FOREIGN KEY (ticket_tier_id) REFERENCES public.event_ticket_tiers(id)
);
CREATE TABLE public.event_science_details (
  event_id uuid NOT NULL,
  call_for_papers boolean DEFAULT false,
  submission_deadline timestamp with time zone,
  abstract_word_limit integer,
  accept_pdf_uploads boolean DEFAULT true,
  topics ARRAY DEFAULT '{}'::text[],
  pub_language text DEFAULT 'en'::text,
  CONSTRAINT event_science_details_pkey PRIMARY KEY (event_id),
  CONSTRAINT event_science_details_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_speakers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  title text,
  org_name text,
  topic text,
  photo_url text,
  sort_order integer DEFAULT 0,
  CONSTRAINT event_speakers_pkey PRIMARY KEY (id),
  CONSTRAINT event_speakers_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_sport_details (
  event_id uuid NOT NULL,
  team_a_name text,
  team_b_name text,
  team_a_score integer,
  team_b_score integer,
  league_name text,
  live_score_enabled boolean DEFAULT false,
  CONSTRAINT event_sport_details_pkey PRIMARY KEY (event_id),
  CONSTRAINT event_sport_details_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_ticket_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  tier_shape text,
  price bigint NOT NULL DEFAULT 0,
  perks text,
  quantity integer,
  sold integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  CONSTRAINT event_ticket_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT event_ticket_tiers_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['sport'::text, 'science'::text, 'charity'::text, 'cultural'::text])),
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'live'::text, 'completed'::text, 'cancelled'::text])),
  visibility text DEFAULT 'open'::text CHECK (visibility = ANY (ARRAY['open'::text, 'invite_only'::text, 'private'::text])),
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  registration_closes_at timestamp with time zone,
  venue_name text,
  address text,
  wilaya text,
  city text,
  location USER-DEFINED,
  is_online boolean DEFAULT false,
  online_url text,
  is_international boolean DEFAULT false,
  capacity integer,
  waitlist_enabled boolean DEFAULT false,
  team_mode boolean DEFAULT false,
  is_paid boolean DEFAULT false,
  cover_url text,
  media_urls ARRAY DEFAULT '{}'::text[],
  tags ARRAY DEFAULT '{}'::text[],
  xp_checkin integer DEFAULT 100,
  xp_completion integer DEFAULT 200,
  xp_winner integer DEFAULT 0,
  xp_volunteer_multiplier boolean DEFAULT true,
  registration_count integer DEFAULT 0,
  checkin_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  fundraising_goal bigint,
  fundraising_current bigint DEFAULT 0,
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_live boolean DEFAULT false,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  require_custom_form boolean DEFAULT false,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.golden_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  company_name text NOT NULL,
  message text,
  status text DEFAULT 'sent'::text CHECK (status = ANY (ARRAY['sent'::text, 'accepted'::text, 'declined'::text, 'expired'::text])),
  expires_at timestamp with time zone DEFAULT (now() + '48:00:00'::interval),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT golden_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT golden_tickets_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES public.profiles(id),
  CONSTRAINT golden_tickets_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.message_reactions (
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  CONSTRAINT message_reactions_pkey PRIMARY KEY (message_id, user_id, emoji),
  CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id),
  CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text,
  msg_type text DEFAULT 'text'::text CHECK (msg_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text, 'poll'::text, 'announcement'::text, 'system'::text, 'voice'::text])),
  file_url text,
  file_name text,
  file_size integer,
  is_broadcast boolean DEFAULT false,
  edited_at timestamp with time zone,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.chat_channels(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['event_update'::text, 'registration_confirmed'::text, 'event_starts_soon'::text, 'friend_registered'::text, 'new_follower'::text, 'connection_request'::text, 'volunteer_approved'::text, 'volunteer_rejected'::text, 'badge_earned'::text, 'xp_gained'::text, 'level_up'::text, 'golden_ticket'::text, 'flash_alert'::text, 'org_verified'::text, 'org_rejected'::text, 'new_message'::text, 'new_dm'::text])),
  title text,
  body text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.org_followers (
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  followed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT org_followers_pkey PRIMARY KEY (org_id, user_id),
  CONSTRAINT org_followers_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT org_followers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.org_members (
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])),
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT org_members_pkey PRIMARY KEY (org_id, user_id),
  CONSTRAINT org_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT org_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  org_type text NOT NULL CHECK (org_type = ANY (ARRAY['university_club'::text, 'student_association'::text, 'ngo'::text, 'sports_club'::text, 'company'::text, 'government'::text, 'other'::text])),
  official_email text NOT NULL,
  registration_number text,
  website text,
  description text,
  logo_url text,
  cover_url text,
  document_url text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'under_review'::text, 'approved'::text, 'rejected'::text])),
  rejection_reason text,
  verified boolean DEFAULT false,
  follower_count integer DEFAULT 0,
  event_count integer DEFAULT 0,
  total_attendees integer DEFAULT 0,
  wilaya text,
  city text,
  location USER-DEFINED,
  founded_year integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.poll_votes (
  poll_id uuid NOT NULL,
  user_id uuid NOT NULL,
  option_id text NOT NULL,
  voted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT poll_votes_pkey PRIMARY KEY (poll_id, user_id),
  CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id),
  CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.polls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid UNIQUE,
  question text NOT NULL,
  options jsonb NOT NULL,
  ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT polls_pkey PRIMARY KEY (id),
  CONSTRAINT polls_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  author_id uuid NOT NULL,
  post_type text DEFAULT 'update'::text CHECK (post_type = ANY (ARRAY['update'::text, 'announcement'::text])),
  content text,
  media_urls ARRAY DEFAULT '{}'::text[],
  is_draft boolean DEFAULT false,
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone DEFAULT now(),
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  player_number integer NOT NULL DEFAULT nextval('profiles_player_number_seq'::regclass) UNIQUE,
  username text NOT NULL UNIQUE,
  full_name text NOT NULL,
  avatar_url text,
  shape text CHECK (shape = ANY (ARRAY['circle'::text, 'triangle'::text, 'square'::text, 'diamond'::text])),
  shape_color text,
  bio text,
  wilaya text,
  city text,
  location USER-DEFINED,
  is_student boolean DEFAULT false,
  university text,
  study_year text,
  role text NOT NULL DEFAULT 'participant'::text CHECK (role = ANY (ARRAY['participant'::text, 'organizer'::text, 'recruiter'::text, 'local_admin'::text, 'global_admin'::text])),
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  onboarding_done boolean DEFAULT false,
  volunteer_available boolean DEFAULT true,
  stealth_mode boolean DEFAULT false,
  visibility text DEFAULT 'public'::text CHECK (visibility = ANY (ARRAY['public'::text, 'followers'::text, 'private'::text])),
  show_in_talent_pool boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.qr_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  org_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT qr_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT qr_tokens_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT qr_tokens_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.saved_events (
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  saved_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_events_pkey PRIMARY KEY (user_id, event_id),
  CONSTRAINT saved_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT saved_events_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text CHECK (category = ANY (ARRAY['tech'::text, 'social'::text, 'leadership'::text, 'other'::text])),
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);
CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.sponsorships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  org_id uuid NOT NULL,
  tier text CHECK (tier = ANY (ARRAY['bronze'::text, 'silver'::text, 'gold'::text])),
  amount bigint,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sponsorships_pkey PRIMARY KEY (id),
  CONSTRAINT sponsorships_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT sponsorships_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.stories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  event_id uuid,
  audience text DEFAULT 'followers'::text CHECK (audience = ANY (ARRAY['followers'::text, 'event_registrants'::text, 'staff'::text])),
  pinned_to_event boolean DEFAULT false,
  expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  caption text,
  bg_gradient text,
  is_highlight boolean DEFAULT false,
  reply_count integer DEFAULT 0,
  reaction_counts jsonb DEFAULT '{}'::jsonb,
  owner_type text DEFAULT 'user'::text CHECK (owner_type = ANY (ARRAY['user'::text, 'org'::text])),
  CONSTRAINT stories_pkey PRIMARY KEY (id),
  CONSTRAINT stories_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT stories_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.story_frames (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  media_url text,
  media_type text CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text])),
  duration_ms integer DEFAULT 5000,
  overlays jsonb DEFAULT '[]'::jsonb,
  sort_order integer DEFAULT 0,
  caption text,
  bg_gradient text,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now(),
  sticker_data jsonb DEFAULT '[]'::jsonb,
  tagged_user_ids ARRAY DEFAULT '{}'::uuid[],
  tagged_event_ids ARRAY DEFAULT '{}'::uuid[],
  tagged_org_ids ARRAY DEFAULT '{}'::uuid[],
  filter_css text,
  audio_url text,
  CONSTRAINT story_frames_pkey PRIMARY KEY (id),
  CONSTRAINT story_frames_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id)
);
CREATE TABLE public.story_poll_votes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  frame_id uuid NOT NULL,
  user_id uuid NOT NULL,
  option_selected text NOT NULL CHECK (option_selected = ANY (ARRAY['A'::text, 'B'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT story_poll_votes_pkey PRIMARY KEY (id),
  CONSTRAINT story_poll_votes_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES public.story_frames(id),
  CONSTRAINT story_poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.story_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  frame_id uuid,
  user_id uuid NOT NULL,
  emoji text NOT NULL DEFAULT '❤️'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT story_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT story_reactions_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id),
  CONSTRAINT story_reactions_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES public.story_frames(id),
  CONSTRAINT story_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.story_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  frame_id uuid,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT story_replies_pkey PRIMARY KEY (id),
  CONSTRAINT story_replies_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id),
  CONSTRAINT story_replies_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES public.story_frames(id),
  CONSTRAINT story_replies_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.story_views (
  story_id uuid NOT NULL,
  user_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT story_views_pkey PRIMARY KEY (story_id, user_id),
  CONSTRAINT story_views_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id),
  CONSTRAINT story_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.team_members (
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (team_id, user_id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  leader_id uuid NOT NULL,
  shape text,
  color text,
  max_members integer DEFAULT 5,
  is_public boolean DEFAULT true,
  is_ready boolean DEFAULT false,
  skills_needed ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT teams_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_badges (
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  event_id uuid,
  earned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_badges_pkey PRIMARY KEY (user_id, badge_id),
  CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id),
  CONSTRAINT user_badges_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.user_follows (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_follows_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id),
  CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_skills (
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  verified_by text,
  CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_id),
  CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
CREATE TABLE public.volunteer_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  applied_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  CONSTRAINT volunteer_applications_pkey PRIMARY KEY (id),
  CONSTRAINT volunteer_applications_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.volunteer_roles(id),
  CONSTRAINT volunteer_applications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT volunteer_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT volunteer_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.volunteer_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  slots integer NOT NULL DEFAULT 1,
  filled integer DEFAULT 0,
  skills ARRAY DEFAULT '{}'::text[],
  perks text,
  shift_start timestamp with time zone,
  shift_end timestamp with time zone,
  sort_order integer DEFAULT 0,
  CONSTRAINT volunteer_roles_pkey PRIMARY KEY (id),
  CONSTRAINT volunteer_roles_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.xp_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  event_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT xp_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT xp_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT xp_transactions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);