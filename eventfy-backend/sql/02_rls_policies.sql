-- ================================================
-- EVENTFY ROW LEVEL SECURITY POLICIES
-- Run AFTER 01_schema.sql
-- ================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ORGANIZATIONS
CREATE POLICY "orgs_public_read" ON organizations FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid());
CREATE POLICY "orgs_owner_update" ON organizations FOR UPDATE
  USING (owner_id = auth.uid());
CREATE POLICY "orgs_insert_auth" ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- EVENTS
CREATE POLICY "events_public_read" ON events FOR SELECT
  USING (status IN ('live','completed','scheduled') OR created_by = auth.uid());
CREATE POLICY "events_org_insert" ON events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM org_members WHERE org_id = events.org_id AND user_id = auth.uid()));
CREATE POLICY "events_org_update" ON events FOR UPDATE
  USING (created_by = auth.uid());

-- REGISTRATIONS
CREATE POLICY "registrations_own_read" ON event_registrations FOR SELECT
  USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.created_by = auth.uid()));
CREATE POLICY "registrations_own_insert" ON event_registrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- MESSAGES
CREATE POLICY "messages_channel_read" ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_channels cc
    JOIN event_registrations er ON er.event_id = cc.event_id
    WHERE cc.id = channel_id AND er.user_id = auth.uid()
  ));
CREATE POLICY "messages_own_insert" ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- NOTIFICATIONS
CREATE POLICY "notifications_own" ON notifications FOR ALL
  USING (user_id = auth.uid());

-- QR TOKENS
CREATE POLICY "qr_tokens_org_insert" ON qr_tokens FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.created_by = auth.uid()));
CREATE POLICY "qr_tokens_auth_read" ON qr_tokens FOR SELECT
  USING (auth.uid() IS NOT NULL AND expires_at > NOW());

-- CERTIFICATES
CREATE POLICY "certs_public_read" ON certificates FOR SELECT USING (true);

-- CONNECTIONS
CREATE POLICY "connections_own" ON connections FOR ALL
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- POSTS
CREATE POLICY "posts_public_read" ON posts FOR SELECT
  USING (is_draft = false);
CREATE POLICY "posts_org_insert" ON posts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM org_members WHERE org_id = posts.org_id AND user_id = auth.uid()));
CREATE POLICY "posts_org_update" ON posts FOR UPDATE
  USING (author_id = auth.uid());
