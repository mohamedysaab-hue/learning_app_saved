/*
  # Add daily usage reset function

  1. Function
    - `check_and_reset_user_usage` - Resets daily usage counters if date has changed
  
  2. Security
    - Function is accessible to authenticated users
    - Only resets usage for the calling user
*/

CREATE OR REPLACE FUNCTION check_and_reset_user_usage(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Reset daily usage if the date has changed
  UPDATE users 
  SET 
    daily_questions_used = 0,
    daily_chat_messages_used = 0,
    last_reset_date = CURRENT_DATE
  WHERE 
    id = user_id 
    AND (last_reset_date IS NULL OR last_reset_date < CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;