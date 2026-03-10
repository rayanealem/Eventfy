-- ================================================
-- MIGRATION: Organization Follows
-- ================================================

-- 1. Create org_followers table
CREATE TABLE IF NOT EXISTS org_followers (
  org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

CREATE INDEX IF NOT EXISTS org_followers_org_idx ON org_followers (org_id);
CREATE INDEX IF NOT EXISTS org_followers_user_idx ON org_followers (user_id);

-- 2. Add follower_count to organizations if it doesn't exist
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- 3. Row Level Security (RLS)
ALTER TABLE org_followers ENABLE ROW LEVEL SECURITY;

-- Anyone can see who follows an organization
CREATE POLICY "Anyone can read org followers"
  ON org_followers FOR SELECT
  USING (true);

-- Authenticated users can only insert their own follow records
CREATE POLICY "Users can follow organizations"
  ON org_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can only delete their own follow records
CREATE POLICY "Users can unfollow organizations"
  ON org_followers FOR DELETE
  USING (auth.uid() = user_id);
