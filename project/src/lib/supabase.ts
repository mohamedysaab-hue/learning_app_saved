import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          age: number
          level: 'Starter' | 'Moderate' | 'Expert'
          xp: number
          streak: number
          questions_answered: number
          correct_answers: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          level: 'Starter' | 'Moderate' | 'Expert'
          xp?: number
          streak?: number
          questions_answered?: number
          correct_answers?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          level?: 'Starter' | 'Moderate' | 'Expert'
          xp?: number
          streak?: number
          questions_answered?: number
          correct_answers?: number
          created_at?: string
          updated_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string
          message?: string
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          questions_answered: number
          session_xp: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          questions_answered?: number
          session_xp?: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          questions_answered?: number
          session_xp?: number
          completed_at?: string
          created_at?: string
        }
      }
      question_attempts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          selected_answer: string
          correct_answer: string
          is_correct: boolean
          xp_gained: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          selected_answer: string
          correct_answer: string
          is_correct: boolean
          xp_gained: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          selected_answer?: string
          correct_answer?: string
          is_correct?: boolean
          xp_gained?: number
          created_at?: string
        }
      }
    }
  }
}