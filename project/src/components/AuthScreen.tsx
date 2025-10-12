import React, { useState } from 'react';
import { Brain, Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle, Home } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error?: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error?: any }>;
  onResetPassword: (email: string) => Promise<{ error?: any }>;
  onBackToLanding: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp, onResetPassword, onBackToLanding }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'forgot') {
        const result = await onResetPassword(email);
        if (result.error) {
          setError(result.error.message || 'Failed to send reset email');
        } else {
          setSuccess('Password reset email sent! Check your inbox.');
          setEmail('');
        }
        return;
      }

      if (mode === 'signup') {
        const result = await onSignUp(email, password);
        if (result.error) {
          if (result.error.message?.includes('User already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(result.error.message || 'Failed to create account');
          }
        } else {
          setSuccess('🎉 Account created successfully! Please check your email inbox and click the verification link to activate your account. After verification, return here and sign in with your credentials.');
          setEmail('');
          setPassword('');
          // Don't auto-switch to signin, let user read the message
        }
      } else {
        const result = await onSignIn(email, password);
        if (result.error) {
          if (result.error.message?.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link before signing in.');
          } else {
            setError(result.error.message || 'Authentication failed');
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Landing */}
        <div className="text-center mb-4">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </button>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Implementor</h1>
          <p className="text-gray-600">Learn AI concepts through interactive questions</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {mode !== 'forgot' && (
            <div className="flex mb-6">
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  mode === 'signin'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  mode === 'signup'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-6">
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setSuccess('');
                }}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </button>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {mode === 'signin' && 'Sign in to continue your AI learning journey'}
              {mode === 'signup' && 'Create your account to start learning AI concepts'}
              {mode === 'forgot' && 'Enter your email to receive a password reset link'}
            </p>
      {mode === 'signup' && success && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Check your email inbox (including spam folder)</li>
            <li>Click the verification link in the email</li>
            <li>Return here and click "Sign In" to access your account</li>
          </ol>
          <button
            onClick={() => {
              setMode('signin');
              setSuccess('');
            }}
            className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm underline"
          >
            Go to Sign In →
          </button>
        </div>
      )}

          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {mode === 'signup' ? 'Creating Account...' : mode === 'forgot' ? 'Sending Email...' : 'Signing In...'}
                </div>
              ) : (
                <>
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </>
              )}
            </button>
          </form>

          {mode === 'signin' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;