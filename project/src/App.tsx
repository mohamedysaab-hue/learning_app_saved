import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { userService } from './services/userService';
import { User, Question, GameState, LeaderboardPlayer } from './types';
import { getRandomQuestion } from './data/questions';
import OnboardingScreen from './components/OnboardingScreen';
import GameScreen from './components/GameScreen';
import ProfileScreen from './components/ProfileScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import DashboardScreen from './components/DashboardScreen';
import PricingScreen from './components/PricingScreen';
import AuthScreen from './components/AuthScreen';
import LandingPage from './components/LandingPage';

function App() {
  const { user: authUser, loading: authLoading, signInWithEmail, signUpWithEmail, resetPassword, signOut } = useSupabaseAuth();
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'auth' | 'onboarding' | 'game' | 'profile' | 'leaderboard' | 'dashboard' | 'pricing'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: false,
    questionsAnswered: 0,
    sessionXP: 0
  });
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);

  const loadNewQuestion = (currentUser: User = user!) => {
    const question = getRandomQuestion(currentUser.level, currentUser.age, usedQuestionIds);
    
    if (!question) {
      // If no more questions available, reset the used questions
      setUsedQuestionIds([]);
      const freshQuestion = getRandomQuestion(currentUser.level, currentUser.age, []);
      setCurrentQuestion(freshQuestion);
      if (freshQuestion) {
        setUsedQuestionIds([freshQuestion.id]);
      }
    } else {
      setCurrentQuestion(question);
      setUsedQuestionIds(prev => [...prev, question.id]);
    }

    setGameState({
      currentQuestion: question,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false,
      questionsAnswered: gameState.questionsAnswered,
      sessionXP: gameState.sessionXP
    });
  };

  // Handle authentication and user data loading
  useEffect(() => {
    const initializeApp = async () => {
      if (authLoading) return;

      if (!authUser) {
        // Show auth screen if no user
        setLoading(false);
        // Don't auto-navigate to auth, stay on current screen
        return;
      }

      try {
        // Try to get existing user data
        const existingUser = await userService.getUser();
        if (existingUser) {
          setUser(existingUser);
          setCurrentScreen('dashboard');
          loadNewQuestion(existingUser);
        } else {
          // No user profile exists, show onboarding
          setCurrentScreen('onboarding');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setCurrentScreen('onboarding');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [authUser, authLoading]);

  // Update leaderboard when user changes
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (user && authUser) {
        try {
          const leaderboardData = await userService.getLeaderboard();
          setLeaderboard(leaderboardData);
        } catch (error) {
          console.error('Error loading leaderboard:', error);
          // Fallback to empty leaderboard
          setLeaderboard([]);
        }
      }
    };

    loadLeaderboard();
  }, [user, authUser]);

  // Check for subscription updates when user returns to app
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user && authUser) {
        try {
          // Sync subscription status when user returns to app
          const updatedUser = await userService.syncSubscriptionStatus();
          if (updatedUser && updatedUser.subscriptionPlan !== user.subscriptionPlan) {
            setUser(updatedUser);
            console.log('Subscription status updated:', updatedUser.subscriptionPlan);
          }
        } catch (error) {
          console.error('Error syncing subscription status:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, authUser]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Implementor...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated and on landing screen
  if (!authUser && !loading && currentScreen === 'landing') {
    return (
      <LandingPage 
        onGetStarted={() => setCurrentScreen('auth')}
        onSignIn={() => setCurrentScreen('auth')}
      />
    );
  }

  // Show auth screen if not authenticated and on auth screen
  if (!authUser && !loading && currentScreen === 'auth') {
    return (
      <AuthScreen 
        onSignIn={signInWithEmail} 
        onSignUp={signUpWithEmail}
        onResetPassword={resetPassword}
        onBackToLanding={() => setCurrentScreen('landing')}
      />
    );
  }

  // If not authenticated and not on landing/auth, redirect to landing
  if (!authUser && !loading && currentScreen !== 'landing' && currentScreen !== 'auth') {
    setCurrentScreen('landing');
    return null;
  }

  const handleOnboardingComplete = async (userData: { name: string; age: number; level: string }) => {
    if (!authUser) {
      console.error('No authenticated user');
      return;
    }

    try {
      const newUser = await userService.createUser({
        name: userData.name,
        age: userData.age,
        level: userData.level as 'Starter' | 'Moderate' | 'Expert',
      });
      
      setUser(newUser);
      setCurrentScreen('dashboard');
      loadNewQuestion(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      // Handle error - maybe show error message to user
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!currentQuestion || !user || !authUser) return;

    // Check if user can answer more questions
    const limits = {
      free_trial: 50,
      professional: 500,
      premium: Infinity
    };
    
    const currentLimit = limits[user.subscriptionPlan as keyof typeof limits] || 50;
    
    if (user.dailyQuestionsUsed >= currentLimit) {
      // Don't allow more questions if limit reached
      return;
    }

    // Check if user can answer more questions
    const isCorrect = answer === currentQuestion.correctAnswer;
    const xpGained = isCorrect ? 20 : 5;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showFeedback: true,
      isCorrect,
      sessionXP: prev.sessionXP + xpGained
    }));

    // Update user stats
    const updatedUser = {
      ...user,
      xp: user.xp + xpGained,
      questionsAnswered: user.questionsAnswered + 1,
      correctAnswers: user.correctAnswers + (isCorrect ? 1 : 0),
      streak: isCorrect ? user.streak + 1 : Math.max(0, user.streak - 1)
    };

    try {
      // Update user in database
      await userService.updateUser(updatedUser);
      
      // Record the question attempt
      await userService.recordQuestionAttempt(
        currentQuestion.id,
        answer,
        currentQuestion.correctAnswer,
        isCorrect,
        xpGained
      );
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user data:', error);
      // Still update local state even if database update fails
      setUser(updatedUser);
    }
  };

  const handleNextQuestion = () => {
    if (!user) return;

    const newQuestionsAnswered = gameState.questionsAnswered + 1;
    
    setGameState(prev => ({
      ...prev,
      questionsAnswered: newQuestionsAnswered,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false
    }));

    if (newQuestionsAnswered >= 10) {
      // Session complete
      setGameState(prev => ({
        ...prev,
        questionsAnswered: 0,
        sessionXP: 0
      }));
    }

    loadNewQuestion();
  };

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen as any);
  };

  if (!user && currentScreen === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your learning experience...</p>
        </div>
      </div>
    );
  }

  switch (currentScreen) {
    case 'dashboard':
      return (
        <DashboardScreen
          user={user}
          onNavigate={handleNavigation}
          onSignOut={signOut}
        />
      );
    case 'profile':
      return (
        <ProfileScreen
          user={user}
          onNavigate={handleNavigation}
          onSignOut={signOut}
        />
      );
    case 'leaderboard':
      return (
        <LeaderboardScreen
          user={user}
          leaderboard={leaderboard}
          onNavigate={handleNavigation}
          onSignOut={signOut}
        />
      );
    case 'pricing':
      return (
        <PricingScreen
          user={user}
          supabaseAuthUser={authUser}
          onNavigate={handleNavigation}
          onSignOut={signOut}
        />
      );
    case 'game':
    default:
      return (
        <GameScreen
          user={user}
          currentQuestion={currentQuestion}
          gameState={gameState}
          onAnswerSubmit={handleAnswerSubmit}
          onNextQuestion={handleNextQuestion}
          onNavigate={handleNavigation}
          onSignOut={signOut}
        />
      );
  }
}

export default App;