-- 07_event_counters_rpc.sql

-- 1. Increment Like
CREATE OR REPLACE FUNCTION increment_event_like(p_event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET like_count = COALESCE(like_count, 0) + 1
  WHERE id = p_event_id;
END;
$$;

-- 2. Decrement Like
CREATE OR REPLACE FUNCTION decrement_event_like(p_event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
  WHERE id = p_event_id;
END;
$$;

-- 3. Increment Comment
CREATE OR REPLACE FUNCTION increment_event_comment(p_event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET comment_count = COALESCE(comment_count, 0) + 1
  WHERE id = p_event_id;
END;
$$;
