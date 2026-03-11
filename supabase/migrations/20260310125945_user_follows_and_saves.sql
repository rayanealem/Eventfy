-- saved_events table
CREATE TABLE IF NOT EXISTS saved_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_events_event ON saved_events(event_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_user  ON saved_events(user_id);

ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own saves" ON saved_events;
CREATE POLICY "Users can read own saves"
    ON saved_events FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert own saves" ON saved_events;
CREATE POLICY "Authenticated users can insert own saves"
    ON saved_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saves" ON saved_events;
CREATE POLICY "Users can delete own saves"
    ON saved_events FOR DELETE
    USING (auth.uid() = user_id);

-- user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read user_follows" ON user_follows;
CREATE POLICY "Anyone can read user_follows"
    ON user_follows FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert own follows" ON user_follows;
CREATE POLICY "Authenticated users can insert own follows"
    ON user_follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can delete own follows" ON user_follows;
CREATE POLICY "Users can delete own follows"
    ON user_follows FOR DELETE
    USING (auth.uid() = follower_id);

-- profiles table counter columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER NOT NULL DEFAULT 0;
