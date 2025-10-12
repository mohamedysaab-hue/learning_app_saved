import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, Trophy, Flame, LogOut } from 'lucide-react';
import { Question, GameState, User } from '../types';

interface GameScreenProps {
  user: User;
  currentQuestion: Question | null;
  gameState: GameState;
  onAnswerSubmit: (answer: string) => void;
  onNextQuestion: () => void;
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  user,
  currentQuestion,
  gameState,
  onAnswerSubmit,
  onNextQuestion,
  onNavigate,
  onSignOut
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (gameState.showFeedback) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.showFeedback]);

  const handleAnswerSelect = (answer: string) => {
    if (!gameState.showFeedback) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      onAnswerSubmit(selectedAnswer);
    }
  };

  const handleContinue = () => {
    setSelectedAnswer(null);
    onNextQuestion();
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user.name[0]}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500">Level {Math.floor(user.xp / 100) + 1}</div>
            </div>
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 font-bold">{user.streak}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-700 font-bold">{user.xp}</span>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(gameState.questionsAnswered / 10) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Question {gameState.questionsAnswered + 1} of 10</span>
            <span>+{gameState.sessionXP} XP this session</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = gameState.showFeedback && option === currentQuestion.correctAnswer;
              const isWrong = gameState.showFeedback && selectedAnswer === option && !gameState.isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={gameState.showFeedback}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50'
                      : isWrong
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${gameState.showFeedback ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      isCorrect ? 'text-green-800' : isWrong ? 'text-red-800' : 'text-gray-800'
                    }`}>
                      {option}
                    </span>
                    {isCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                    {isWrong && <XCircle className="w-6 h-6 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {gameState.showFeedback && (
            <div className={`mt-6 p-4 rounded-xl ${
              gameState.isCorrect ? 'bg-green-100' : 'bg-red-100'
            } ${showAnimation ? 'animate-pulse' : ''}`}>
              <div className={`font-semibold text-lg mb-2 ${
                gameState.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {gameState.isCorrect ? 'Correct! 🎉' : 'Not quite right 😅'}
              </div>
              <p className={`text-sm ${
                gameState.isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="text-center">
          {!gameState.showFeedback ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                selectedAnswer
                  ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="bg-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 mx-auto"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;