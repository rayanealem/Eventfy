-- ═══════════════════════════════════════════════════════
-- Eventfy Migration: event_likes, event_comments tables
-- + like_count, comment_count, is_live columns on events
-- ═══════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to run multiple times (uses IF NOT EXISTS / CREATE OR REPLACE)
-- ═══════════════════════════════════════════════════════


-- ── 1. event_likes table ──────────────────────────────
CREATE TABLE IF NOT EXISTS event_likes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_likes_event ON event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user  ON event_likes(user_id);


-- ── 2. event_comments table ──────────────────────────
CREATE TABLE IF NOT EXISTS event_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_comments_event ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user  ON event_comments(user_id);


-- ── 3. Add columns to events table ───────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS like_count    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_live       BOOLEAN NOT NULL DEFAULT false;


-- ── 4. Row-Level Security ────────────────────────────

-- event_likes
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can read likes"
    ON event_likes FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert own likes"
    ON event_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own likes"
    ON event_likes FOR DELETE
    USING (auth.uid() = user_id);

-- event_comments
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can read comments"
    ON event_comments FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert own comments"
    ON event_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own comments"
    ON event_comments FOR DELETE
    USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════
-- Done! You can verify by running:
-- SELECT * FROM event_likes LIMIT 1;
-- SELECT * FROM event_comments LIMIT 1;
-- SELECT like_count, comment_count, is_live FROM events LIMIT 1;
-- ═══════════════════════════════════════════════════════
