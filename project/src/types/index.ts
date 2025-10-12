export interface User {
  name: string;
  age: number;
  level: 'Starter' | 'Moderate' | 'Expert';
  xp: number;
  streak: number;
  questionsAnswered: number;
  correctAnswers: number;
  subscriptionPlan: 'free_trial' | 'professional' | 'premium';
  trialEndDate: Date | null;
  dailyQuestionsUsed: number;
  dailyChatMessagesUsed: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: 'Starter' | 'Moderate' | 'Expert';
  ageGroup: string;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  xp: number;
  avatar: string;
  streak: number;
}

export interface GameState {
  currentQuestion: Question | null;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean;
  questionsAnswered: number;
  sessionXP: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}