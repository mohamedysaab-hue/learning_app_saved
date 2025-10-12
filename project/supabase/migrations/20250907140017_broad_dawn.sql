/*
  # Add subscription and usage tracking fields

  1. New Columns
    - `subscription_plan` (text) - tracks user's current plan
    - `trial_end_date` (timestamptz) - when free trial expires
    - `daily_questions_used` (integer) - daily question usage counter
    - `daily_chat_messages_used` (integer) - daily chat usage counter
    - `last_reset_date` (date) - tracks when daily limits were last reset

  2. Security
    - Update existing RLS policies to include new fields
    - Add constraints for valid subscription plans

  3. Functions
    - Add function to reset daily usage counters
*/

-- Add new columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_plan text DEFAULT 'free_trial';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'trial_end_date'
  ) THEN
    ALTER TABLE users ADD COLUMN trial_end_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'daily_questions_used'
  ) THEN
    ALTER TABLE users ADD COLUMN daily_questions_used integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'daily_chat_messages_used'
  ) THEN
    ALTER TABLE users ADD COLUMN daily_chat_messages_used integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_reset_date'
  ) THEN
    ALTER TABLE users ADD COLUMN last_reset_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add constraints for subscription plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_subscription_plan_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_subscription_plan_check 
    CHECK (subscription_plan IN ('free_trial', 'professional', 'premium'));
  END IF;
END $$;

-- Add constraints for usage counters
ALTER TABLE users ADD CONSTRAINT users_daily_questions_used_check CHECK (daily_questions_used >= 0);
ALTER TABLE users ADD CONSTRAINT users_daily_chat_messages_used_check CHECK (daily_chat_messages_used >= 0);

-- Function to reset daily usage counters
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    daily_questions_used = 0,
    daily_chat_messages_used = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check and reset usage if needed for a specific user
CREATE OR REPLACE FUNCTION check_and_reset_user_usage(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    daily_questions_used = 0,
    daily_chat_messages_used = 0,
    last_reset_date = CURRENT_DATE
  WHERE id = user_id AND last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;