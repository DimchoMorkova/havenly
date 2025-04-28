/*
  # Create reservations table and related schemas

  1. New Tables
    - `reservations`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, references listings)
      - `user_id` (uuid, references profiles)
      - `check_in_date` (date)
      - `check_out_date` (date)
      - `guests` (integer)
      - `total_price` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `reservations` table
    - Add policies for:
      - Users can read their own reservations
      - Users can create reservations
      - Users can update their own reservations
      - Hosts can read reservations for their listings

  3. Constraints
    - Check that check_out_date is after check_in_date
    - Check that guests count is within listing's max_guests
    - Prevent overlapping reservations for the same listing
*/

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  guests integer NOT NULL,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure check_out_date is after check_in_date
  CONSTRAINT check_dates_order CHECK (check_out_date > check_in_date),
  
  -- Ensure guests count is within listing's max_guests
  CONSTRAINT check_guests_count CHECK (guests > 0)
);

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own reservations
CREATE POLICY "Users can read their own reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to create reservations
CREATE POLICY "Users can create reservations"
  ON reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own reservations
CREATE POLICY "Users can update their own reservations"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for hosts to read reservations for their listings
CREATE POLICY "Hosts can read reservations for their listings"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = reservations.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Function to check for overlapping reservations
CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE listing_id = NEW.listing_id
    AND status != 'cancelled'
    AND id != NEW.id
    AND (
      (NEW.check_in_date, NEW.check_out_date) OVERLAPS 
      (check_in_date, check_out_date)
    )
  ) THEN
    RAISE EXCEPTION 'Reservation dates overlap with an existing reservation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate max guests against listing
CREATE OR REPLACE FUNCTION check_max_guests()
RETURNS trigger AS $$
BEGIN
  IF NEW.guests > (
    SELECT max_guests FROM listings WHERE id = NEW.listing_id
  ) THEN
    RAISE EXCEPTION 'Number of guests exceeds listing maximum';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent overlapping reservations
CREATE TRIGGER prevent_reservation_overlap
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION check_reservation_overlap();

-- Trigger to enforce max guests constraint
CREATE TRIGGER enforce_max_guests
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION check_max_guests();

-- Create indexes for faster reservation lookups
CREATE INDEX reservations_listing_id_idx ON reservations(listing_id);
CREATE INDEX reservations_user_id_idx ON reservations(user_id);
CREATE INDEX reservations_dates_idx ON reservations(listing_id, check_in_date, check_out_date);