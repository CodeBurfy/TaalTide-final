-- Temporarily remove the foreign key constraint
ALTER TABLE events 
  DROP CONSTRAINT IF EXISTS events_created_by_fkey;

-- Update the created_by column to use Firebase UIDs
-- No need to change the data type as TEXT can store Firebase UIDs
-- Just update the foreign key reference to point to auth.users.id
ALTER TABLE events
  ADD CONSTRAINT events_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- Update the users table to match Firebase auth
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

-- Recreate the users table to match Firebase auth structure
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate foreign key constraints
ALTER TABLE events
  ADD CONSTRAINT events_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- Update RLS policies for the events table
DROP POLICY IF EXISTS "Users can create events" ON events;
CREATE POLICY "Users can create events" 
  ON events
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
