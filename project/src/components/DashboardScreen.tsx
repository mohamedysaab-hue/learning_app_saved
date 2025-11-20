import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Flame, 
  TrendingUp, 
  BookOpen, 
  MessageCircle,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  LogOut,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { User } from '../types';
import { userService } from '../services/userService';

interface DashboardScreenProps {
  user: User;
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onNavigate, onSignOut }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi ${user.name}! I'm your AI learning assistant. I can help explain AI concepts, answer questions about your progress, or provide study tips. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentLevel = Math.floor(user.xp / 100) + 1;
  const xpInCurrentLevel = user.xp % 100;
  const accuracy = user.questionsAnswered > 0 ? Math.round((user.correctAnswers / user.questionsAnswered) * 100) : 0;

  // Check if trial is expired
  const isTrialExpired = user.subscriptionPlan === 'free_trial' && user.trialEndDate && new Date() > user.trialEndDate;
  const daysLeft = user.trialEndDate ? Math.max(0, Math.ceil((user.trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // Usage limits based on plan
  const limits = {
    free_trial: { questions: 50, chat: 10 },
    professional: { questions: 500, chat: 100 },
    premium: { questions: Infinity, chat: Infinity }
  };

  const currentLimits = limits[user.subscriptionPlan as keyof typeof limits] || limits.free_trial;

  const stats = [
    { label: 'Total XP', value: user.xp, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Current Level', value: currentLevel, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Questions Answered', value: user.questionsAnswered, icon: Target, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Current Streak', value: user.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check usage limits
    if (user.dailyChatMessagesUsed >= currentLimits.chat) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `You've reached your daily chat limit (${currentLimits.chat} messages). ${user.subscriptionPlan === 'free_trial' ? 'Upgrade to continue chatting!' : 'Your limit will reset tomorrow.'}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Check usage limits
    if (user.dailyChatMessagesUsed >= currentLimits.chat) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `You've reached your daily chat limit (${currentLimits.chat} messages). ${user.subscriptionPlan === 'free_trial' ? 'Upgrade to continue chatting!' : 'Your limit will reset tomorrow.'}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = `User: ${user.name}, Level: ${user.level}, XP: ${user.xp}, Accuracy: ${accuracy}%`;
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-gpt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Increment chat usage after successful response
      await userService.incrementChatUsage();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center max-w-6xl mx-auto">
          <button
            onClick={() => onNavigate('game')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Learning Dashboard</h1>
              <p className="text-sm text-gray-600">Track your progress and get AI assistance</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('pricing')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end max-w-6xl mx-auto">
          <button
            onClick={onSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Trial Status Banner */}
        {user.subscriptionPlan === 'free_trial' && (
          <div className={`mb-6 p-4 rounded-2xl ${isTrialExpired ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isTrialExpired ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : (
                  <Crown className="w-6 h-6 text-blue-500" />
                )}
                <div>
                  <h3 className={`font-semibold ${isTrialExpired ? 'text-red-800' : 'text-blue-800'}`}>
                    {isTrialExpired ? 'Free Trial Expired' : `Free Trial - ${daysLeft} days left`}
                  </h3>
                  <p className={`text-sm ${isTrialExpired ? 'text-red-600' : 'text-blue-600'}`}>
                    {isTrialExpired 
                      ? 'Upgrade to continue learning with unlimited access'
                      : `Daily limits: ${user.dailyQuestionsUsed}/${currentLimits.questions} questions, ${user.dailyChatMessagesUsed}/${currentLimits.chat} chat messages`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('pricing')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isTrialExpired 
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isTrialExpired ? 'Upgrade Now' : 'View Plans'}
              </button>
            </div>
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{user.name[0]}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</h2>
                  <p className="text-gray-600">{user.level} Level • {accuracy}% Accuracy</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Level {currentLevel}</span>
                  <span>Level {currentLevel + 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${xpInCurrentLevel}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {100 - xpInCurrentLevel} XP to next level
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => onNavigate('game')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-[1.02]"
                  disabled={isTrialExpired}
                >
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">
                    {isTrialExpired ? 'Upgrade to Continue' : 'Continue Learning'}
                    {isTrialExpired ? 'Upgrade to Continue' : 'Continue Learning'}
                  </div>
                  <div className="text-sm opacity-90">
                    {isTrialExpired ? 'Trial expired' : 'Answer more questions'}
                    {isTrialExpired ? 'Trial expired' : 'Answer more questions'}
                  </div>
                </button>
                <button
                  onClick={() => onNavigate('profile')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all hover:scale-[1.02]"
                >
                  <UserIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">View Profile</div>
                  <div className="text-sm opacity-90">Check achievements</div>
                </button>
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all hover:scale-[1.02]"
                >
                  <Trophy className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">Leaderboard</div>
                  <div className="text-sm opacity-90">See your ranking</div>
                </button>
              </div>
            </div>
          </div>

          {/* AI Chat Assistant */}
          <div className="bg-white rounded-3xl shadow-lg p-6 h-fit">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">AI Assistant</h3>
                <p className="text-sm text-gray-600">Ask me anything about AI!</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'ai' && (
                        <Bot className="w-4 h-4 mt-0.5 text-purple-500" />
                      )}
                      <div className="text-sm">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-purple-500" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about AI concepts..."
                disabled={isLoading || user.dailyChatMessagesUsed >= currentLimits.chat}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || user.dailyChatMessagesUsed >= currentLimits.chat}
                className="bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {user.dailyChatMessagesUsed >= currentLimits.chat && (
              <p className="text-xs text-gray-500 mt-2">
                Daily chat limit reached. {user.subscriptionPlan === 'free_trial' ? 'Upgrade for more messages!' : 'Resets tomorrow.'}
              </p>
            )}
            {user.dailyChatMessagesUsed >= currentLimits.chat && (
              <p className="text-xs text-gray-500 mt-2">
                Daily chat limit reached. {user.subscriptionPlan === 'free_trial' ? 'Upgrade for more messages!' : 'Resets tomorrow.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;