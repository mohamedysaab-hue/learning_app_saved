/*
  # Create user sessions and question attempts tables

  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `questions_answered` (integer, questions in this session)
      - `session_xp` (integer, XP gained in this session)
      - `completed_at` (timestamp, when session was completed)
      - `created_at` (timestamp)

    - `question_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `question_id` (text, identifier for the question)
      - `selected_answer` (text, user's selected answer)
      - `correct_answer` (text, the correct answer)
      - `is_correct` (boolean, whether answer was correct)
      - `xp_gained` (integer, XP gained from this attempt)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  questions_answered integer DEFAULT 0 CHECK (questions_answered >= 0),
  session_xp integer DEFAULT 0 CHECK (session_xp >= 0),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  selected_answer text NOT NULL,
  correct_answer text NOT NULL,
  is_correct boolean NOT NULL,
  xp_gained integer DEFAULT 0 CHECK (xp_gained >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for user_sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for question_attempts
CREATE POLICY "Users can read own attempts"
  ON question_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON question_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_created_at ON question_attempts(created_at);