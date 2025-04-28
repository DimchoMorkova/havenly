/*
  # Create listings table and related schemas

  1. New Tables
    - `listings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `property_type` (text)
      - `access_type` (text)
      - `address` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `max_guests` (integer)
      - `bedrooms` (integer)
      - `beds` (integer)
      - `bathrooms` (numeric)
      - `amenities` (text[])
      - `photos` (text[])
      - `highlights` (text[])
      - `price_per_night` (numeric)
      - `currency` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `listings` table
    - Add policies for:
      - Authenticated users can read all published listings
      - Users can create their own listings
      - Users can update their own listings
      - Users can delete their own listings
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text,
  description text,
  property_type text NOT NULL,
  access_type text NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  max_guests integer NOT NULL,
  bedrooms integer NOT NULL,
  beds integer NOT NULL,
  bathrooms numeric NOT NULL,
  amenities text[],
  photos text[],
  highlights text[],
  price_per_night numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy for reading published listings
CREATE POLICY "Anyone can read published listings"
  ON listings
  FOR SELECT
  USING (status = 'published');

-- Policy for creating listings
CREATE POLICY "Users can create their own listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating own listings
CREATE POLICY "Users can update their own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting own listings
CREATE POLICY "Users can delete their own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);