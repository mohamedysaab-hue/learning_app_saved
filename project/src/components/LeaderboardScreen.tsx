import React from 'react';
import { Trophy, Medal, Crown, ArrowLeft, Flame, LogOut } from 'lucide-react';
import { User, LeaderboardPlayer } from '../types';

interface LeaderboardScreenProps {
  user: User;
  leaderboard: LeaderboardPlayer[];
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  user,
  leaderboard,
  onNavigate,
  onSignOut
}) => {
  const userRank = leaderboard.findIndex(player => player.name === user.name) + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
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
            <h1 className="text-xl font-bold text-gray-800">Weekly Leaderboard</h1>
            <p className="text-sm text-gray-600">See how you rank against other learners</p>
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
        {/* Top 3 Podium */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="flex justify-center items-end space-x-4 mb-8">
            {/* Second Place */}
            {leaderboard[1] && (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-white font-bold text-lg">{leaderboard[1].name[0]}</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 w-20 h-16 flex items-center justify-center">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">2nd</div>
                    <div className="text-sm font-bold">{leaderboard[1].xp}</div>
                  </div>
                </div>
                <p className="text-sm font-semibold mt-2">{leaderboard[1].name}</p>
              </div>
            )}

            {/* First Place */}
            {leaderboard[0] && (
              <div className="text-center">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-white font-bold text-xl">{leaderboard[0].name[0]}</span>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 w-24 h-20 flex items-center justify-center">
                  <div>
                    <div className="text-xs text-yellow-700 mb-1">1st</div>
                    <div className="text-lg font-bold text-yellow-800">{leaderboard[0].xp}</div>
                  </div>
                </div>
                <p className="text-sm font-semibold mt-2">{leaderboard[0].name}</p>
              </div>
            )}

            {/* Third Place */}
            {leaderboard[2] && (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-white font-bold text-lg">{leaderboard[2].name[0]}</span>
                </div>
                <div className="bg-orange-100 rounded-lg p-3 w-20 h-12 flex items-center justify-center">
                  <div>
                    <div className="text-xs text-orange-700 mb-1">3rd</div>
                    <div className="text-sm font-bold text-orange-800">{leaderboard[2].xp}</div>
                  </div>
                </div>
                <p className="text-sm font-semibold mt-2">{leaderboard[2].name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">All Rankings</h2>
          <div className="space-y-2">
            {leaderboard.map((player, index) => {
              const rank = index + 1;
              const isCurrentUser = player.name === user.name;
              
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(rank)}
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      rank <= 3
                        ? rank === 1
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                          : rank === 2
                          ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                          : 'bg-gradient-to-r from-orange-400 to-orange-600'
                        : 'bg-gradient-to-r from-blue-400 to-purple-500'
                    }`}>
                      <span className="text-white font-bold">{player.name[0]}</span>
                    </div>
                    <div>
                      <div className={`font-semibold ${
                        isCurrentUser ? 'text-blue-800' : 'text-gray-800'
                      }`}>
                        {player.name} {isCurrentUser && '(You)'}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>{player.xp} XP</span>
                        <div className="flex items-center space-x-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span>{player.streak}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      isCurrentUser ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      #{rank}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Stats */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Your Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{userRank}</div>
              <div className="text-sm text-blue-600">Current Rank</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round((user.correctAnswers / user.questionsAnswered) * 100) || 0}%</div>
              <div className="text-sm text-green-600">Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;