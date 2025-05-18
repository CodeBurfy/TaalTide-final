/*
  # Create Events and Vendors Tables

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date_start` (timestamptz)
      - `date_end` (timestamptz)
      - `location` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `user_id` (uuid, foreign key to auth.users)
      - `image_url` (text)
    
    - `vendors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `location` (text)
      - `category` (text)
      - `is_featured` (boolean)
      - `created_at` (timestamptz)
      - `user_id` (uuid, foreign key to auth.users)
      - `image_url` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date_start timestamptz NOT NULL,
  date_end timestamptz NOT NULL,
  location text,
  category text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  image_url text
);

-- Enable RLS for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
CREATE POLICY "Anyone can view events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text,
  category text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  image_url text
);

-- Enable RLS for vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendors
CREATE POLICY "Anyone can view vendors"
  ON vendors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create vendors"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors"
  ON vendors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);