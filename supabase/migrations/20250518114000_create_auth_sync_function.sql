-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.created_at,
    new.updated_at
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANTE EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Update RLS policies for the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users are viewable by everyone." 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
