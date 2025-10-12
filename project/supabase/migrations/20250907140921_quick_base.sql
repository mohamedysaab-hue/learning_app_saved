/*
  # Add Stripe Customer ID to Users Table

  1. Changes
    - Add `stripe_customer_id` column to users table
    - Add index for faster lookups
    - Add constraint to ensure uniqueness

  2. Security
    - No RLS changes needed as this is internal data
*/

-- Add stripe_customer_id column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id text;
  END IF;
END $$;

-- Add unique constraint on stripe_customer_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_stripe_customer_id_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_stripe_customer_id_key UNIQUE (stripe_customer_id);
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users (stripe_customer_id);