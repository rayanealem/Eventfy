-- ================================================
-- EVENTFY FUNCTIONS & HELPERS
-- Run AFTER 02_rls_policies.sql
-- ================================================

-- Clean up expired QR tokens
CREATE OR REPLACE FUNCTION cleanup_expired_qr_tokens()
RETURNS void AS $$
  DELETE FROM qr_tokens WHERE expires_at < NOW();
$$ LANGUAGE sql;

-- Nearby events PostGIS function
CREATE OR REPLACE FUNCTION events_nearby(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 50,
  lim INTEGER DEFAULT 20,
  off INTEGER DEFAULT 0
)
RETURNS SETOF events AS $$
  SELECT *
  FROM events
  WHERE location IS NOT NULL
    AND status IN ('scheduled', 'live')
    AND ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  )
  LIMIT lim OFFSET off;
$$ LANGUAGE sql STABLE;

-- Seed default platform badges
INSERT INTO badges (name, description, shape, color, xp_value, criteria) VALUES
  ('First Check-In', 'Checked in to your first event', 'circle', '#00ffc2', 50, '{"type": "checkin_count", "threshold": 1}'),
  ('Regular Attendee', 'Checked in to 5 events', 'circle', '#3b82f6', 100, '{"type": "checkin_count", "threshold": 5}'),
  ('Event Enthusiast', 'Checked in to 10 events', 'triangle', '#ffd700', 200, '{"type": "checkin_count", "threshold": 10}'),
  ('Event Veteran', 'Checked in to 25 events', 'square', '#ff6b35', 500, '{"type": "checkin_count", "threshold": 25}'),
  ('Event Legend', 'Checked in to 50 events', 'diamond', '#e91e63', 1000, '{"type": "checkin_count", "threshold": 50}'),
  ('Team Player', 'Joined your first team', 'triangle', '#8b5cf6', 75, '{"type": "team_join_count", "threshold": 1}'),
  ('Volunteer Hero', 'Completed 3 volunteer shifts', 'square', '#10b981', 300, '{"type": "volunteer_count", "threshold": 3}'),
  ('Social Butterfly', 'Made 10 connections', 'circle', '#f59e0b', 150, '{"type": "connection_count", "threshold": 10}'),
  ('Skill Collector', 'Added 5 skills to your profile', 'diamond', '#06b6d4', 100, '{"type": "skill_count", "threshold": 5}')
ON CONFLICT (name) DO NOTHING;
