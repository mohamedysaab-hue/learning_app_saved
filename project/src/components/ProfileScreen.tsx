import React from 'react';
import { User, Trophy, Target, Calendar, ArrowLeft, Flame, Award, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileScreenProps {
  user: UserType;
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate, onSignOut }) => {
  const currentLevel = Math.floor(user.xp / 100) + 1;
  const xpInCurrentLevel = user.xp % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;
  const accuracy = user.questionsAnswered > 0 ? Math.round((user.correctAnswers / user.questionsAnswered) * 100) : 0;

  const achievements = [
    {
      id: 'first_question',
      name: 'First Steps',
      description: 'Answer your first question',
      icon: Target,
      unlocked: user.questionsAnswered >= 1,
      color: 'blue'
    },
    {
      id: 'streak_3',
      name: 'Getting Warmed Up',
      description: 'Maintain a 3-day streak',
      icon: Flame,
      unlocked: user.streak >= 3,
      color: 'orange'
    },
    {
      id: 'accuracy_80',
      name: 'Sharp Mind',
      description: 'Achieve 80% accuracy',
      icon: Award,
      unlocked: accuracy >= 80,
      color: 'green'
    },
    {
      id: 'xp_500',
      name: 'Dedicated Learner',
      description: 'Earn 500 XP',
      icon: Trophy,
      unlocked: user.xp >= 500,
      color: 'purple'
    }
  ];

  const stats = [
    { label: 'Questions Answered', value: user.questionsAnswered, icon: Target },
    { label: 'Current Streak', value: user.streak, icon: Flame },
    { label: 'Accuracy Rate', value: `${accuracy}%`, icon: Award },
    { label: 'Total XP', value: user.xp, icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Your Profile</h1>
            <p className="text-sm text-gray-600">Track your learning progress</p>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{user.name[0]}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.age} years old • {user.level} Level</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Level {currentLevel}
                </span>
                <span className="text-gray-500 text-sm">{user.xp} XP total</span>
              </div>
            </div>
          </div>

          {/* Progress to Next Level */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Level {currentLevel}</span>
              <span>Level {currentLevel + 1}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(xpInCurrentLevel / 100) * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {xpToNextLevel} XP to level up!
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <IconComponent className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              const colorClasses = {
                blue: achievement.unlocked ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-400',
                orange: achievement.unlocked ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-gray-50 border-gray-200 text-gray-400',
                green: achievement.unlocked ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-400',
                purple: achievement.unlocked ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-gray-50 border-gray-200 text-gray-400'
              };

              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 ${colorClasses[achievement.color as keyof typeof colorClasses]} transition-all ${
                    achievement.unlocked ? 'hover:scale-[1.02]' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className={`w-6 h-6 mt-1 ${
                      achievement.unlocked
                        ? achievement.color === 'blue' ? 'text-blue-500'
                        : achievement.color === 'orange' ? 'text-orange-500'
                        : achievement.color === 'green' ? 'text-green-500'
                        : 'text-purple-500'
                        : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        achievement.unlocked ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                        {achievement.unlocked && <span className="ml-2">🏆</span>}
                      </h4>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => onNavigate('leaderboard')}
            className="flex-1 bg-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
          >
            View Leaderboard
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;