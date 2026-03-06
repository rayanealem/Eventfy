-- ============================================================
-- EVENTFY — MOCK SEED DATA
-- File: sql/04_seed_data.sql
-- Run AFTER 01_schema.sql, 02_rls_policies.sql, 03_functions.sql
-- ============================================================
-- FIXED: Removed DO $$ block — uses literal UUIDs instead of
-- PL/pgSQL variables to avoid Supabase SQL Editor truncation.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────────────────────

INSERT INTO profiles (id, username, full_name, bio, wilaya, city,
  shape, shape_color, is_student, university, study_year,
  role, xp, level, onboarding_done, volunteer_available, visibility)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'ahmed_dev', 'Ahmed Benali',
   'CS Student @ USTHB. Python & React dev. Love hackathons.',
   'Algiers', 'Bab Ezzouar',
   'circle', '#FF2D78', TRUE, 'USTHB', '3rd Year',
   'participant', 4820, 7, TRUE, TRUE, 'public'),

  ('a2000000-0000-0000-0000-000000000002', 'sara_design', 'Sara Meziane',
   'UI/UX Designer. Volunteer at Green Earth NGO.',
   'Algiers', 'Hydra',
   'diamond', '#00E5CC', TRUE, 'ESI', '4th Year',
   'participant', 2100, 5, TRUE, TRUE, 'public'),

  ('a3000000-0000-0000-0000-000000000003', 'yacine_ml', 'Yacine Bouzid',
   'ML Engineer. Kaggle Master. Speaker at AI events.',
   'Oran', 'Oran Centre',
   'triangle', '#FFD700', FALSE, NULL, NULL,
   'participant', 7200, 9, TRUE, FALSE, 'public'),

  ('b1000000-0000-0000-0000-000000000001', 'microclub_admin', 'Micro Club USTHB',
   'Official student tech club of USTHB.',
   'Algiers', 'Bab Ezzouar',
   'square', '#00E5CC', FALSE, NULL, NULL,
   'organizer', 12000, 10, TRUE, FALSE, 'public'),

  ('b2000000-0000-0000-0000-000000000002', 'greenearth_admin', 'Green Earth Algeria',
   'Environmental NGO based in Algiers.',
   'Algiers', 'Didouche Mourad',
   'square', '#00E5CC', FALSE, NULL, NULL,
   'organizer', 8500, 9, TRUE, FALSE, 'public'),

  ('c1000000-0000-0000-0000-000000000001', 'techcorp_hr', 'TechCorp Algeria HR',
   'Talent acquisition for TechCorp Algeria.',
   'Algiers', 'Hydra',
   'diamond', '#FFD700', FALSE, NULL, NULL,
   'recruiter', 0, 1, TRUE, FALSE, 'public'),

  ('d1000000-0000-0000-0000-000000000001', 'eventfy_admin', 'Eventfy Admin',
   'Platform administrator.',
   'Algiers', 'Algiers',
   'diamond', '#FF4D4D', FALSE, NULL, NULL,
   'global_admin', 99999, 10, TRUE, FALSE, 'private')
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SKILLS
-- ────────────────────────────────────────────────────────────

INSERT INTO skills (name, category) VALUES
  ('Python', 'tech'),
  ('React', 'tech'),
  ('Machine Learning', 'tech'),
  ('UI/UX Design', 'tech'),
  ('Django', 'tech'),
  ('Node.js', 'tech'),
  ('Data Science', 'tech'),
  ('DevOps', 'tech'),
  ('Leadership', 'leadership'),
  ('Event Management', 'leadership'),
  ('Public Speaking', 'social'),
  ('Arabic', 'social'),
  ('French', 'social'),
  ('English', 'social'),
  ('Community Building', 'social')
ON CONFLICT (name) DO NOTHING;

-- User skills
INSERT INTO user_skills (user_id, skill_id, verified, verified_by)
SELECT 'a1000000-0000-0000-0000-000000000001', id, TRUE, 'event_attendance'
FROM skills WHERE name IN ('Python', 'React', 'Django')
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, verified, verified_by)
SELECT 'a1000000-0000-0000-0000-000000000001', id, FALSE, NULL
FROM skills WHERE name IN ('Machine Learning', 'Leadership')
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, verified, verified_by)
SELECT 'a2000000-0000-0000-0000-000000000002', id, TRUE, 'event_attendance'
FROM skills WHERE name IN ('UI/UX Design', 'Event Management', 'Public Speaking')
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, verified, verified_by)
SELECT 'a3000000-0000-0000-0000-000000000003', id, TRUE, 'event_attendance'
FROM skills WHERE name IN ('Machine Learning', 'Python', 'Data Science')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- ORGANIZATIONS
-- ────────────────────────────────────────────────────────────

INSERT INTO organizations (id, owner_id, name, slug, org_type,
  official_email, description, status, verified,
  follower_count, event_count, total_attendees,
  wilaya, city, website, founded_year)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Micro Club USTHB', 'micro-club-usthb',
   'university_club', 'contact@microclub.dz',
   'The oldest and largest tech student club in Algeria. Founded at USTHB, organizing hackathons, workshops, and coding competitions since 2001.',
   'approved', TRUE,
   1240, 24, 8400,
   'Algiers', 'Bab Ezzouar', 'https://microclub.dz', 2001),

  ('e2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Green Earth Algeria', 'green-earth-algeria',
   'ngo', 'info@greenearth.dz',
   'Environmental NGO focused on sustainability, community cleanups, and environmental education across Algeria.',
   'approved', TRUE,
   892, 12, 3200,
   'Algiers', 'Didouche Mourad', 'https://greenearth.dz', 2018),

  ('e3000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001',
   'Algiers Music Collective', 'algiers-music-collective',
   'other', 'contact@amc.dz',
   'Promoting Algerian music culture and connecting artists with audiences.',
   'approved', FALSE,
   340, 5, 1200,
   'Algiers', 'Algiers', NULL, 2020)
ON CONFLICT (id) DO NOTHING;

-- Org members
INSERT INTO org_members (org_id, user_id, role)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'owner'),
  ('e2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'owner'),
  ('e3000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'owner')
ON CONFLICT DO NOTHING;

-- Org followers
INSERT INTO org_followers (org_id, user_id)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('e1000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002'),
  ('e1000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003'),
  ('e2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'),
  ('e2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002'),
  ('e3000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- EVENTS (4 types + 1 draft)
-- ────────────────────────────────────────────────────────────

INSERT INTO events (id, org_id, created_by, title, slug, description,
  event_type, status, visibility,
  starts_at, ends_at, registration_closes_at,
  venue_name, address, wilaya, city,
  capacity, waitlist_enabled,
  cover_url, tags,
  xp_checkin, xp_completion, xp_winner,
  registration_count, checkin_count, view_count,
  is_paid, is_international)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Inter-Uni Football Cup 2026', 'inter-uni-football-cup-2026',
   'The biggest inter-university football tournament in Algeria. 16 teams compete across 3 days. Open to all university students. Free registration.',
   'sport', 'live', 'open',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '5 days',
   NOW() + INTERVAL '1 day',
   'Stade du 5 Juillet', '5 Juillet Sports Complex, Algiers', 'Algiers', 'Algiers',
   500, TRUE,
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
   ARRAY['football','sport','university','tournament'],
   100, 200, 500,
   284, 0, 1420,
   FALSE, FALSE),

  ('f2000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Inter-Uni AI Summit 2026', 'inter-uni-ai-summit-2026',
   'Algeria''s premier AI and machine learning research conference. Call for papers open. Keynote speakers from MIT, INRIA, and leading Algerian universities.',
   'science', 'scheduled', 'open',
   NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days',
   NOW() + INTERVAL '10 days',
   'Salle des Conferences USTHB', 'USTHB Campus, Bab Ezzouar, Algiers', 'Algiers', 'Bab Ezzouar',
   300, FALSE,
   'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
   ARRAY['ai','machine-learning','research','conference','python'],
   150, 300, 0,
   87, 0, 2100,
   FALSE, FALSE),

  ('f3000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Ramadan Food Drive 2026', 'ramadan-food-drive-2026',
   'Community food distribution initiative during Ramadan. We collect and distribute food packages to families in need across Algiers. Volunteers needed for sorting, packaging, and delivery.',
   'charity', 'live', 'open',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '30 days',
   NOW() + INTERVAL '2 days',
   'Grande Poste Algiers', 'Place Grande Poste, Algiers Centre', 'Algiers', 'Algiers',
   200, FALSE,
   'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
   ARRAY['charity','volunteer','ramadan','community'],
   120, 250, 0,
   94, 0, 890,
   FALSE, FALSE),

  ('f4000000-0000-0000-0000-000000000004', 'e3000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001',
   'Algiers Music Festival 2026', 'algiers-music-festival-2026',
   'A two-day celebration of Algerian music spanning chaabi, rai, jazz, and contemporary artists. Live performances at the legendary Algiers Arena.',
   'cultural', 'scheduled', 'open',
   NOW() + INTERVAL '30 days', NOW() + INTERVAL '32 days',
   NOW() + INTERVAL '25 days',
   'Algiers Arena', 'Algiers Arena, Rouiba', 'Algiers', 'Rouiba',
   2000, TRUE,
   'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
   ARRAY['music','festival','culture','algiers'],
   200, 400, 0,
   412, 0, 3800,
   TRUE, FALSE),

  ('f5000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Hackathon 2026 (Draft)', 'hackathon-2026-draft',
   'Draft event — not yet published.',
   'science', 'draft', 'open',
   NOW() + INTERVAL '60 days', NOW() + INTERVAL '63 days',
   NOW() + INTERVAL '55 days',
   'USTHB', 'USTHB Campus', 'Algiers', 'Bab Ezzouar',
   400, TRUE,
   NULL,
   ARRAY['hackathon','coding'],
   200, 500, 1000,
   0, 0, 0,
   FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- EVENT TYPE DETAILS
-- ────────────────────────────────────────────────────────────

INSERT INTO event_sport_details (event_id, team_a_name, team_b_name,
  team_a_score, team_b_score, league_name, live_score_enabled)
VALUES ('f1000000-0000-0000-0000-000000000001', 'Valiant FC', 'Titan UTD', 3, 1,
  'Inter-University League Season 1', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO event_science_details (event_id, call_for_papers,
  submission_deadline, abstract_word_limit, topics, pub_language)
VALUES ('f2000000-0000-0000-0000-000000000002', TRUE,
  NOW() + INTERVAL '7 days', 500,
  ARRAY['nlp','computer-vision','reinforcement-learning','llm','robotics'], 'en')
ON CONFLICT DO NOTHING;

INSERT INTO event_speakers (event_id, name, title, org_name, topic, sort_order)
VALUES
  ('f2000000-0000-0000-0000-000000000002', 'Dr. Aris Takouti', 'Professor of AI', 'USTHB',
   'Large Language Models in Low-Resource Languages', 1),
  ('f2000000-0000-0000-0000-000000000002', 'Prof. V. Kosmos', 'Research Director', 'INRIA',
   'Reinforcement Learning for Robotics', 2),
  ('f2000000-0000-0000-0000-000000000002', 'Dr. Amina Cherif', 'AI Lead', 'Djezzy Tech',
   'AI Applications in Algerian Industry', 3)
ON CONFLICT DO NOTHING;

INSERT INTO event_charity_details (event_id, show_live_progress, currency)
VALUES ('f3000000-0000-0000-0000-000000000003', TRUE, 'DZD')
ON CONFLICT DO NOTHING;

UPDATE events SET
  fundraising_goal = 2000000,
  fundraising_current = 847000
WHERE id = 'f3000000-0000-0000-0000-000000000003';

INSERT INTO event_cultural_details (event_id, require_age_verify)
VALUES ('f4000000-0000-0000-0000-000000000004', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO event_performers (event_id, name, stage_name, time_slot, role, sort_order)
VALUES
  ('f4000000-0000-0000-0000-000000000004', 'Khaled Sahraoui', 'DJ Sahraoui', '21:00 - 23:00', 'Headliner', 1),
  ('f4000000-0000-0000-0000-000000000004', 'Amira Benseghir', 'Amira B', '19:00 - 20:30', 'Main Act', 2),
  ('f4000000-0000-0000-0000-000000000004', 'Mehdi Lounes', 'Lounes', '18:00 - 19:00', 'Opening Act', 3)
ON CONFLICT DO NOTHING;

INSERT INTO event_ticket_tiers (event_id, name, tier_shape, price, perks, quantity, sort_order)
VALUES
  ('f4000000-0000-0000-0000-000000000004', 'STANDARD', 'square', 1500,
   'General admission - Standing area - Eventfy badge', 1500, 1),
  ('f4000000-0000-0000-0000-000000000004', 'VIP PASS', 'triangle', 4500,
   'Reserved seating - Meet and greet - Exclusive merchandise - +500 XP', 300, 2),
  ('f4000000-0000-0000-0000-000000000004', 'VVIP ULTIMATE', 'circle', 12000,
   'Front row - Backstage access - Artist dinner - Certificate - +1000 XP', 50, 3)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- VOLUNTEER ROLES
-- ────────────────────────────────────────────────────────────

INSERT INTO volunteer_roles (event_id, name, slots, filled, skills, perks, shift_start, shift_end)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Gate Keeper', 5, 3,
   ARRAY['Communication','Stamina'],
   'Free access + +300 XP + Community Hero badge',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 8 hours'),

  ('f1000000-0000-0000-0000-000000000001', 'Media Team', 3, 3,
   ARRAY['Photography','Video Editing'],
   'Free access + +400 XP + Media badge + Certificate',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '5 days'),

  ('f3000000-0000-0000-0000-000000000003', 'Food Packager', 10, 4,
   ARRAY['Stamina','Community Building'],
   '+250 XP + Volunteer badge + Certificate',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 6 hours'),

  ('f3000000-0000-0000-0000-000000000003', 'Delivery Driver', 4, 1,
   ARRAY['Driving'],
   '+300 XP + Driver badge + Certificate',
   NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 8 hours'),

  ('f3000000-0000-0000-0000-000000000003', 'Logistics Coordinator', 2, 0,
   ARRAY['Leadership','Event Management'],
   '+500 XP + Coordinator badge + Certificate',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- REGISTRATIONS
-- ────────────────────────────────────────────────────────────

INSERT INTO event_registrations (event_id, user_id, status, checked_in)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'confirmed', FALSE),
  ('f3000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'confirmed', FALSE),
  ('f2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'confirmed', FALSE),
  ('f3000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 'confirmed', FALSE),
  ('f4000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000002', 'confirmed', FALSE),
  ('f2000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'confirmed', FALSE),
  ('f1000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'confirmed', FALSE)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- VOLUNTEER APPLICATIONS
-- ────────────────────────────────────────────────────────────

INSERT INTO volunteer_applications (role_id, event_id, user_id, status)
SELECT vr.id, 'f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'approved'
FROM volunteer_roles vr
WHERE vr.event_id = 'f1000000-0000-0000-0000-000000000001' AND vr.name = 'Gate Keeper'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_applications (role_id, event_id, user_id, status)
SELECT vr.id, 'f3000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 'pending'
FROM volunteer_roles vr
WHERE vr.event_id = 'f3000000-0000-0000-0000-000000000003' AND vr.name = 'Food Packager'
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- TEAMS (sport event)
-- ────────────────────────────────────────────────────────────

INSERT INTO teams (id, event_id, name, code, leader_id, shape, color,
  max_members, is_public, is_ready, skills_needed)
VALUES
  ('aa100000-0000-0000-0000-000000000001',
   'f1000000-0000-0000-0000-000000000001', 'Alpha Squad', 'T-4821',
   'a1000000-0000-0000-0000-000000000001', 'circle', '#FF2D78',
   5, TRUE, FALSE, ARRAY['Striker','Goalkeeper','Midfielder']),

  ('aa200000-0000-0000-0000-000000000002',
   'f1000000-0000-0000-0000-000000000001', 'Titans', 'T-9912',
   'a3000000-0000-0000-0000-000000000003', 'triangle', '#00E5CC',
   5, TRUE, TRUE, ARRAY['Defender','Midfielder'])
ON CONFLICT DO NOTHING;

INSERT INTO team_members (team_id, user_id, role)
VALUES
  ('aa100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'CAPTAIN'),
  ('aa200000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'CAPTAIN'),
  ('aa200000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'MIDFIELDER')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- CHAT CHANNELS + MESSAGES
-- ────────────────────────────────────────────────────────────

INSERT INTO chat_channels (id, event_id, name, channel_type, shape, is_locked)
VALUES
  ('cc100000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'general', 'event', 'circle', FALSE),
  ('cc100000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'team-formation', 'event', 'triangle', FALSE),
  ('cc100000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'announcements', 'event', 'square', FALSE),
  ('cc100000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001', 'staff-only', 'event', 'diamond', TRUE),
  ('cc200000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002', 'general', 'event', 'circle', FALSE),
  ('cc200000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000002', 'announcements', 'event', 'square', FALSE),
  ('cc300000-0000-0000-0000-000000000001', 'f3000000-0000-0000-0000-000000000003', 'general', 'event', 'circle', FALSE),
  ('cc300000-0000-0000-0000-000000000002', 'f3000000-0000-0000-0000-000000000003', 'staff-only', 'event', 'diamond', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO messages (channel_id, sender_id, content, msg_type, created_at)
VALUES
  ('cc100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Welcome to Inter-Uni Football Cup 2026! Registration closes tomorrow. Get your teams ready!',
   'announcement', NOW() - INTERVAL '2 hours'),

  ('cc100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Ahmed B joined the lobby.', 'system', NOW() - INTERVAL '1 hour 45 min'),

  ('cc100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Can''t wait for the tournament! Alpha Squad is ready', 'text', NOW() - INTERVAL '1 hour'),

  ('cc100000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003',
   'Titans are ready. See you on the field', 'text', NOW() - INTERVAL '45 min'),

  ('cc100000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002',
   'Any spots left for Gate Keeper volunteers?', 'text', NOW() - INTERVAL '20 min'),

  ('cc200000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Call for Papers is now OPEN. Submit your abstracts before the deadline. PDF uploads only.',
   'announcement', NOW() - INTERVAL '3 days'),

  ('cc200000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003',
   'Submitted my abstract on Transformer models for Darija NLP. Fingers crossed!',
   'text', NOW() - INTERVAL '1 day'),

  ('cc300000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002',
   'Ramadan Mubarak everyone! Volunteer shifts start this Thursday. Please confirm your attendance.',
   'announcement', NOW() - INTERVAL '1 day'),

  ('cc300000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Confirmed for Thursday morning shift! Happy to help', 'text', NOW() - INTERVAL '20 hours')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- BADGES + USER BADGES
-- ────────────────────────────────────────────────────────────

INSERT INTO badges (name, description, shape, color, xp_value, is_custom)
VALUES
  ('First Blood', 'Attended your first event', 'circle', '#FF4D4D', 100, FALSE),
  ('Elite Alpha', 'Reached Level 5', 'diamond', '#FFD700', 500, FALSE),
  ('Community Hero', 'Volunteered at 3 events', 'triangle', '#00E5CC', 300, FALSE),
  ('Socialite', 'Made 10 connections', 'circle', '#FF2D78', 200, FALSE),
  ('Hackathon Veteran', 'Attended 5 hackathons', 'square', '#8B5CF6', 750, FALSE),
  ('Research Pioneer', 'Submitted a paper to a science event', 'triangle', '#00E5CC', 400, FALSE),
  ('Arena Master', 'Attended 10 events', 'diamond', '#FFD700', 1000, FALSE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id, event_id)
SELECT 'a1000000-0000-0000-0000-000000000001', b.id, 'f1000000-0000-0000-0000-000000000001'
FROM badges b WHERE b.name = 'First Blood'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'a1000000-0000-0000-0000-000000000001', b.id
FROM badges b WHERE b.name = 'Elite Alpha'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'a1000000-0000-0000-0000-000000000001', b.id
FROM badges b WHERE b.name = 'Community Hero'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'a2000000-0000-0000-0000-000000000002', b.id
FROM badges b WHERE b.name = 'First Blood'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'a3000000-0000-0000-0000-000000000003', b.id
FROM badges b WHERE b.name IN ('Elite Alpha', 'Research Pioneer', 'Arena Master')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- XP TRANSACTIONS
-- ────────────────────────────────────────────────────────────

INSERT INTO xp_transactions (user_id, amount, reason, event_id)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 100, 'onboarding_complete', NULL),
  ('a1000000-0000-0000-0000-000000000001', 100, 'checkin', 'f1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000001', 200, 'completion', 'f1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000001', 300, 'volunteer', 'f1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000001', 150, 'checkin', 'f2000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000001', 500, 'badge_earned', NULL),
  ('a1000000-0000-0000-0000-000000000001', 3470, 'historical', NULL),

  ('a2000000-0000-0000-0000-000000000002', 100, 'onboarding_complete', NULL),
  ('a2000000-0000-0000-0000-000000000002', 2000, 'historical', NULL),

  ('a3000000-0000-0000-0000-000000000003', 100, 'onboarding_complete', NULL),
  ('a3000000-0000-0000-0000-000000000003', 7100, 'historical', NULL);


-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS (for Ahmed)
-- ────────────────────────────────────────────────────────────

INSERT INTO notifications (user_id, type, title, body, data, is_read)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'volunteer_approved', 'Volunteer Approved',
   'Your application for Gate Keeper at Inter-Uni Football Cup has been approved!',
   jsonb_build_object('event_id', 'f1000000-0000-0000-0000-000000000001', 'role', 'Gate Keeper'),
   FALSE),

  ('a1000000-0000-0000-0000-000000000001', 'badge_earned', 'Badge Unlocked: Community Hero',
   'You earned this for completing your first volunteer shift. +300 XP',
   jsonb_build_object('badge_name', 'Community Hero', 'xp', 300),
   FALSE),

  ('a1000000-0000-0000-0000-000000000001', 'new_follower', 'New Connection',
   'Sara Meziane wants to connect with you.',
   jsonb_build_object('user_id', 'a2000000-0000-0000-0000-000000000002', 'username', 'sara_design'),
   TRUE),

  ('a1000000-0000-0000-0000-000000000001', 'event_update', 'Event Update: AI Summit',
   'Micro Club USTHB posted: Call for Papers is now OPEN. Submit by Jan 15!',
   jsonb_build_object('event_id', 'f2000000-0000-0000-0000-000000000002'),
   TRUE),

  ('a1000000-0000-0000-0000-000000000001', 'golden_ticket', 'Golden Ticket Offer',
   'TechCorp Algeria wants to connect. Fast-track interview offer. Expires in 47H.',
   jsonb_build_object('recruiter_id', 'c1000000-0000-0000-0000-000000000001', 'company', 'TechCorp Algeria'),
   FALSE);


-- ────────────────────────────────────────────────────────────
-- CONNECTIONS
-- ────────────────────────────────────────────────────────────

INSERT INTO connections (requester_id, addressee_id, status)
VALUES
  ('a2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'pending'),
  ('a1000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'accepted'),
  ('a2000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'accepted')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- GOLDEN TICKET
-- ────────────────────────────────────────────────────────────

INSERT INTO golden_tickets (recruiter_id, candidate_id, company_name, message, status)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'TechCorp Algeria',
   'Hi Ahmed, TechCorp Algeria is impressed by your hackathon performance and Python skills. We would like to offer you a fast-track interview for our Junior Developer position.',
   'sent'),
  ('c1000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'TechCorp Algeria',
   'Hi Yacine, your ML expertise caught our eye. We have a Data Scientist role that would be perfect for you.',
   'sent')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- POSTS (org announcements)
-- ────────────────────────────────────────────────────────────

INSERT INTO posts (org_id, author_id, post_type, content, published_at)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'announcement',
   'CALL FOR PAPERS NOW OPEN - Inter-Uni AI Summit 2026. Submit your research abstract before January 15th. Topics: NLP, Computer Vision, RL, LLMs. Maximum 500 words. PDF format required.',
   NOW() - INTERVAL '1 day'),

  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'update',
   'Registration for Inter-Uni Football Cup 2026 is filling up fast! 284 of 500 spots taken. Don''t miss out - register now and bring your team',
   NOW() - INTERVAL '3 days'),

  ('e2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'announcement',
   'Ramadan Mubarak! Our Food Drive kicks off this Thursday. We need 50 more volunteers for packaging and delivery shifts. Every hand counts - sign up in the app!',
   NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- CERTIFICATES
-- ────────────────────────────────────────────────────────────

INSERT INTO certificates (user_id, event_id, org_id, role, verification_code)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'volunteer',
   'CERT-' || upper(substring(gen_random_uuid()::text, 1, 12))),
  ('a3000000-0000-0000-0000-000000000003', 'f2000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'speaker',
   'CERT-' || upper(substring(gen_random_uuid()::text, 1, 12)))
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES (uncomment to test)
-- ────────────────────────────────────────────────────────────

-- SELECT count(*) FROM profiles;           -- expect 7
-- SELECT count(*) FROM organizations;      -- expect 3
-- SELECT count(*) FROM events;             -- expect 5
-- SELECT count(*) FROM event_registrations; -- expect 7
-- SELECT count(*) FROM messages;           -- expect 9
-- SELECT count(*) FROM notifications;      -- expect 5
-- SELECT * FROM events WHERE status != 'draft' ORDER BY starts_at;
-- SELECT p.username, p.xp, p.level FROM profiles p ORDER BY p.xp DESC;
