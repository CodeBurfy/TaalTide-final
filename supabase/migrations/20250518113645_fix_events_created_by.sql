-- Ensure the created_by column exists and has the correct foreign key reference
ALTER TABLE events 
  ALTER COLUMN created_by TYPE TEXT,
  ADD CONSTRAINT fk_events_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- Grant necessary permissions
GRANTE ALL ON events TO authenticated, anon;
GRANTE USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Add a comment for documentation
COMMENT ON COLUMN events.created_by IS 'References auth.users.id';
