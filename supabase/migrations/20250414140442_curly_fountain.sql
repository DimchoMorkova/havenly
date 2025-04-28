/*
  # Add listing interactions tracking system

  1. New Tables
    - `listing_interactions`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, references listings)
      - `interaction_date` (date)
      - `click_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `listing_interactions` table
    - Add policies for:
      - Anyone can read interactions
      - System can create/update interactions

  3. Functions
    - Function to calculate median click rate
    - Function to update trending status
    - Function to increment click count
*/

CREATE TABLE IF NOT EXISTS listing_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  interaction_date date NOT NULL DEFAULT CURRENT_DATE,
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique listing per day
  CONSTRAINT unique_listing_date UNIQUE (listing_id, interaction_date)
);

-- Enable Row Level Security
ALTER TABLE listing_interactions ENABLE ROW LEVEL SECURITY;

-- Policy for reading interactions
CREATE POLICY "Anyone can read listing interactions"
  ON listing_interactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy for system to create/update interactions
CREATE POLICY "System can manage listing interactions"
  ON listing_interactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX listing_interactions_date_idx ON listing_interactions(interaction_date);
CREATE INDEX listing_interactions_listing_date_idx ON listing_interactions(listing_id, interaction_date);

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_listing_click(listing_id_param uuid)
RETURNS void AS $$
DECLARE
  current_date_param date := CURRENT_DATE;
BEGIN
  INSERT INTO listing_interactions (listing_id, interaction_date, click_count)
  VALUES (listing_id_param, current_date_param, 1)
  ON CONFLICT (listing_id, interaction_date)
  DO UPDATE SET 
    click_count = listing_interactions.click_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION get_trending_listings(days_window int DEFAULT 7)
RETURNS TABLE (
  listing_id uuid,
  total_clicks bigint,
  is_trending boolean
) AS $$
DECLARE
  median_clicks numeric;
BEGIN
  -- Calculate the median clicks across all listings
  WITH total_clicks_per_listing AS (
    SELECT 
      li.listing_id,
      COALESCE(SUM(li.click_count), 0) as total_clicks
    FROM listing_interactions li
    WHERE li.interaction_date >= CURRENT_DATE - days_window
    GROUP BY li.listing_id
  ),
  median_calc AS (
    SELECT 
      percentile_cont(0.5) WITHIN GROUP (ORDER BY total_clicks) as median
    FROM total_clicks_per_listing
  )
  SELECT m.median INTO median_clicks FROM median_calc m;
  
  -- Return listings with their trending status
  RETURN QUERY
  WITH listing_stats AS (
    SELECT 
      li.listing_id,
      COALESCE(SUM(li.click_count), 0) as total_clicks
    FROM listing_interactions li
    WHERE li.interaction_date >= CURRENT_DATE - days_window
    GROUP BY li.listing_id
  )
  SELECT 
    ls.listing_id,
    ls.total_clicks,
    CASE 
      WHEN ls.total_clicks > median_clicks AND ls.total_clicks > 0 THEN true 
      ELSE false 
    END as is_trending
  FROM listing_stats ls
  ORDER BY ls.total_clicks DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;