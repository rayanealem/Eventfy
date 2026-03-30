-- ================================================
-- STORY FRAMES ENHANCEMENTS
-- Adds filter_css and audio_url columns to story_frames
-- Run in Supabase SQL Editor
-- ================================================

ALTER TABLE story_frames ADD COLUMN IF NOT EXISTS filter_css TEXT DEFAULT 'none';
ALTER TABLE story_frames ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Add story_reactions table if not exists
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL DEFAULT '❤️',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (story_id, user_id, emoji)
);

-- Add story_poll_votes table if not exists
CREATE TABLE IF NOT EXISTS story_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  frame_id UUID NOT NULL REFERENCES story_frames(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (frame_id, user_id)
);

-- Index for faster story lookups by user
CREATE INDEX IF NOT EXISTS stories_user_id_idx ON stories (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stories_org_id_idx ON stories (org_id) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stories_expires_at_idx ON stories (expires_at);
