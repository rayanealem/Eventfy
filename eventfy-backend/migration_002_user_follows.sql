-- ================================================
-- MIGRATION 002: User-to-User Follows
-- Run in Supabase SQL Editor
-- ================================================

-- user_follows table (one-way, Instagram-style)
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON user_follows (follower_id);
CREATE INDEX IF NOT EXISTS user_follows_following_idx ON user_follows (following_id);

-- Add counter columns to profiles (safe to re-run)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- RLS policies
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view all follows"
  ON user_follows FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can follow others"
  ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY IF NOT EXISTS "Users can unfollow"
  ON user_follows FOR DELETE USING (auth.uid() = follower_id);
