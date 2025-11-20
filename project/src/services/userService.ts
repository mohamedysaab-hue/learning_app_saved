import { supabase } from '../lib/supabase';
import { User } from '../types';

export const userService = {
  async createUser(userData: Omit<User, 'xp' | 'streak' | 'questionsAnswered' | 'correctAnswers'>) {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      throw new Error('User not authenticated');
    }

    // Set trial end date to 7 days from now
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        name: userData.name,
        age: userData.age,
        level: userData.level,
        xp: 0,
        streak: 1,
        questions_answered: 0,
        correct_answers: 0,
        subscription_plan: 'free_trial',
        trial_end_date: trialEndDate.toISOString(),
        daily_questions_used: 0,
        daily_chat_messages_used: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return this.mapDatabaseUserToUser(data);
  },

  async getUser(): Promise<User | null> {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return null;
    }

    try {
      // Reset daily usage if needed
      await supabase.rpc('check_and_reset_user_usage', { user_id: authUser.user.id });
    } catch (error) {
      console.warn('Failed to reset daily usage:', error);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }

    if (!data) {
      // User not found
      return null;
    }

    return this.mapDatabaseUserToUser(data);
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        age: updates.age,
        level: updates.level,
        xp: updates.xp,
        streak: updates.streak,
        questions_answered: updates.questionsAnswered,
        correct_answers: updates.correctAnswers,
        subscription_plan: updates.subscriptionPlan,
        trial_end_date: updates.trialEndDate?.toISOString(),
        daily_questions_used: updates.dailyQuestionsUsed,
        daily_chat_messages_used: updates.dailyChatMessagesUsed,
      })
      .eq('id', authUser.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return this.mapDatabaseUserToUser(data);
  },

  async recordQuestionAttempt(
    questionId: string,
    selectedAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    xpGained: number
  ) {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      throw new Error('User not authenticated');
    }

    // Increment daily questions used
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        daily_questions_used: supabase.sql`daily_questions_used + 1`
      })
      .eq('id', authUser.user.id);

    if (updateError) {
      console.error('Error updating daily questions used:', updateError);
    }

    const { error } = await supabase
      .from('question_attempts')
      .insert({
        user_id: authUser.user.id,
        question_id: questionId,
        selected_answer: selectedAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        xp_gained: xpGained,
      });

    if (error) {
      console.error('Error recording question attempt:', error);
      throw error;
    }
  },

  async incrementChatUsage() {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        daily_chat_messages_used: supabase.sql`daily_chat_messages_used + 1`
      })
      .eq('id', authUser.user.id);

    if (error) {
      console.error('Error incrementing chat usage:', error);
      throw error;
    }
  },

  async updateSubscriptionPlan(plan: 'professional' | 'premium') {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('users')
      .update({ 
        subscription_plan: plan,
        trial_end_date: null, // Clear trial end date for paid plans
        daily_questions_used: 0, // Reset usage on upgrade
        daily_chat_messages_used: 0,
        last_reset_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', authUser.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }

    return this.mapDatabaseUserToUser(data);
  },

  async updateStripeCustomerId(stripeCustomerId: string) {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('users')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', authUser.user.id);

    if (error) {
      console.error('Error updating Stripe customer ID:', error);
      throw error;
    }
  },

  async syncSubscriptionStatus() {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      throw new Error('User not authenticated');
    }

    // Refresh user data from database to get latest subscription status
    const user = await this.getUser();
    return user;
  },

  async getLeaderboard(limit: number = 20) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, xp, streak')
      .order('xp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }

    return data.map(user => ({
      id: user.id,
      name: user.name,
      xp: user.xp,
      avatar: user.name[0].toUpperCase(),
      streak: user.streak,
    }));
  },

  mapDatabaseUserToUser(dbUser: any): User {
    return {
      name: dbUser.name,
      age: dbUser.age,
      level: dbUser.level,
      xp: dbUser.xp,
      streak: dbUser.streak,
      questionsAnswered: dbUser.questions_answered,
      correctAnswers: dbUser.correct_answers,
      subscriptionPlan: dbUser.subscription_plan || 'free_trial',
      trialEndDate: dbUser.trial_end_date ? new Date(dbUser.trial_end_date) : null,
      dailyQuestionsUsed: dbUser.daily_questions_used || 0,
      dailyChatMessagesUsed: dbUser.daily_chat_messages_used || 0,
    };
  },
};