-- ================================================
-- SAVED EVENTS (bookmarks) — migration
-- Run in Supabase SQL Editor
-- ================================================

CREATE TABLE IF NOT EXISTS saved_events (
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id  UUID REFERENCES events(id) ON DELETE CASCADE,
  saved_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS saved_events_user_idx ON saved_events (user_id);

-- RLS
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves"
  ON saved_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
  ON saved_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
  ON saved_events FOR DELETE
  USING (auth.uid() = user_id);
