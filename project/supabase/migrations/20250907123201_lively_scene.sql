/*
  # Create users table for AI Implementor Learning App

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, user's display name)
      - `age` (integer, user's age for content adaptation)
      - `level` (text, AI experience level: Starter, Moderate, Expert)
      - `xp` (integer, total experience points earned)
      - `streak` (integer, current learning streak)
      - `questions_answered` (integer, total questions answered)
      - `correct_answers` (integer, total correct answers)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read and update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL CHECK (age >= 8 AND age <= 100),
  level text NOT NULL CHECK (level IN ('Starter', 'Moderate', 'Expert')),
  xp integer DEFAULT 0 CHECK (xp >= 0),
  streak integer DEFAULT 1 CHECK (streak >= 0),
  questions_answered integer DEFAULT 0 CHECK (questions_answered >= 0),
  correct_answers integer DEFAULT 0 CHECK (correct_answers >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();