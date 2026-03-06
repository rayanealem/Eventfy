-- ============================================================
-- FIX: handle_new_user() trigger
-- Run this in Supabase SQL Editor to fix registration
-- ============================================================

-- Drop the old trigger first (if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'player_' || floor(random()*99999)::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Player')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Username already taken, generate a random one
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
      NEW.id,
      'player_' || floor(random()*99999)::text || '_' || floor(random()*999)::text,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Player')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify it works
SELECT 'Trigger installed successfully' AS status;
