-- Rename created_by to user_id if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'created_by'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE events RENAME COLUMN created_by TO user_id;
  END IF;
END $$;

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE events ADD COLUMN user_id TEXT;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'events_user_id_fkey'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT events_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can create events" ON events;
CREATE POLICY "Users can create events" 
  ON events 
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update column comments
COMMENT ON COLUMN events.user_id IS 'References auth.users.id';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
