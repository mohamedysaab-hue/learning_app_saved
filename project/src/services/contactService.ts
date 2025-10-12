import { supabase } from '../lib/supabase';

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  async submitContactForm(submission: ContactSubmission) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }

    return data;
  },

  async getContactSubmissions() {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact submissions:', error);
      throw error;
    }

    return data;
  }
};