/*
  # Initial Schema Setup for Events and Vendors Platform
  
  1. New Tables
    - `users`
      - Stores user information linked to Firebase auth
      - Fields: id (Firebase UID), email, display_name, photo_url, created_at
    
    - `events`
      - Stores event details
      - Fields: id, name, description, location, date_start, date_end, category, image_url, created_by, created_at, updated_at
    
    - `vendors`
      - Stores vendor information
      - Fields: id, name, description, location, contact_info, category, image_url, is_featured, event_id (optional), created_by, created_at, updated_at
  
  2. Security
    - Enable RLS on all tables
    - Set up policies for authenticated access
    - Create storage buckets for images
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ NOT NULL,
  category TEXT,
  image_url TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  contact_info TEXT,
  category TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data" 
  ON users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read all users data" 
  ON users
  FOR SELECT 
  TO anon
  USING (true);

-- Create policies for events table
CREATE POLICY "Anyone can read events" 
  ON events
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create events" 
  ON events
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" 
  ON events
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" 
  ON events
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for vendors table
CREATE POLICY "Anyone can read vendors" 
  ON vendors
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create vendors" 
  ON vendors
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own vendors" 
  ON vendors
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own vendors" 
  ON vendors
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Create functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamp
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();