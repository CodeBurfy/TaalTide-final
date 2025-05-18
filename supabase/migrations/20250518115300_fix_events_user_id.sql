-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'user_id'
  ) THEN
    -- Add the column as nullable first
    ALTER TABLE events ADD COLUMN user_id TEXT;
    
    -- If created_by exists, copy its values to user_id
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'created_by'
    ) THEN
      UPDATE events SET user_id = created_by;
    END IF;
    
    -- Add foreign key constraint
    ALTER TABLE events 
    ADD CONSTRAINT events_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
    
    -- Add comment
    COMMENT ON COLUMN events.user_id IS 'References auth.users.id';
  END IF;
END $$;

-- Update RLS policies
DO $$
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Users can create events" ON events;
  DROP POLICY IF EXISTS "Users can update their own events" ON events;
  DROP POLICY IF EXISTS "Users can delete their own events" ON events;
  
  -- Create new policies using user_id
  CREATE POLICY "Users can create events" 
    ON events FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can update their own events" 
    ON events FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can delete their own events" 
    ON events FOR DELETE 
    USING (auth.uid() = user_id);
    
  -- Public read access
  CREATE POLICY "Public read access" 
    ON events FOR SELECT 
    USING (true);
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
