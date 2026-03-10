-- ================================================
-- EVENT SOCIALS AND LIVE STATUS
-- Run in Supabase SQL Editor
-- ================================================

-- Add new columns to events table if they don't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Optional: Create an index for quick filtering of live events
CREATE INDEX IF NOT EXISTS events_is_live_idx ON events (is_live) WHERE is_live = TRUE;
