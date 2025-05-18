-- First, check if the created_by column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE events ADD COLUMN created_by TEXT;
    
    -- Set a default value for existing rows if needed
    -- UPDATE events SET created_by = 'system' WHERE created_by IS NULL;
    
    -- Add comment for documentation
    COMMENT ON COLUMN events.created_by IS 'References auth.users.id';
  END IF;
END $$;

-- Now safely add the foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'events_created_by_fkey'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT events_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Ensure the users table exists and has the correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or replace the auth sync function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'created_at')::timestamptz, NOW()),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up RLS and policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies
CREATE POLICY "Users can create events" 
  ON events FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Public users are viewable by everyone" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Grant necessary permissions
GRANTE ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANTE ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANTE ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;
