/*
  # Add listing views tracking system

  1. New Tables
    - `listing_views`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, references listings)
      - `viewed_at` (timestamptz)
      - `ip_address` (text)

  2. Security
    - Enable RLS on `listing_views` table
    - Add policies for:
      - Anyone can create views
      - Listing owners can read views for their listings

  3. Functions
    - Add function to check if listing is trending
*/

CREATE TABLE IF NOT EXISTS listing_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  ip_address text
);

-- Enable Row Level Security
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- Policy for creating views
CREATE POLICY "Anyone can create listing views"
  ON listing_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for reading views
CREATE POLICY "Listing owners can read views"
  ON listing_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_views.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Create index for faster view counting
CREATE INDEX listing_views_listing_id_viewed_at_idx 
  ON listing_views(listing_id, viewed_at);

-- Function to check if a listing is trending
CREATE OR REPLACE FUNCTION is_listing_trending(listing_uuid uuid)
RETURNS boolean AS $$
DECLARE
  listing_views_count integer;
  median_views integer;
BEGIN
  -- Get views count for this listing in the last week
  SELECT COUNT(*)
  INTO listing_views_count
  FROM listing_views
  WHERE listing_id = listing_uuid
  AND viewed_at > now() - interval '1 week';

  -- Get median views across all listings for the last week
  WITH views_per_listing AS (
    SELECT listing_id, COUNT(*) as view_count
    FROM listing_views
    WHERE viewed_at > now() - interval '1 week'
    GROUP BY listing_id
  )
  SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY view_count)
  INTO median_views
  FROM views_per_listing;

  -- Return true if this listing's views are above median
  RETURN listing_views_count > COALESCE(median_views, 0);
END;
$$ LANGUAGE plpgsql;