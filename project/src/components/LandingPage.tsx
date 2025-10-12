import React from 'react';
import { 
  Brain, 
  Zap, 
  Trophy, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Star, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Flame,
  X,
  Lightbulb,
  BarChart3,
  Gamepad2,
  Compass,
  Mail,
  Phone,
  Send,
  MapPin
} from 'lucide-react';
import { contactService, ContactSubmission } from '../services/contactService';
import { stripeService } from '../services/stripeService';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [selectedFeature, setSelectedFeature] = React.useState<number | null>(null);
  const [showContactForm, setShowContactForm] = React.useState(false);
  const [contactForm, setContactForm] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = React.useState(false);
  const [contactSuccess, setContactSuccess] = React.useState(false);
  const [contactError, setContactError] = React.useState('');

  const handleUpgrade = (plan: string, checkoutUrl: string) => {
    // For landing page, redirect to auth first
    onGetStarted();
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Interactive questions adapted to your skill level with instant AI explanations',
      color: 'from-blue-500 to-purple-600',
      detailedInfo: {
        overview: 'Experience the future of AI education with our intelligent learning system that adapts to your unique learning style and pace.',
        keyFeatures: [
          'Adaptive question difficulty based on your performance',
          'Instant AI-generated explanations for every answer',
          'Smart content recommendation engine',
          'Real-time learning analytics and insights',
          'Personalized feedback and improvement suggestions'
        ],
        benefits: [
          'Learn 3x faster than traditional methods',
          'Never get stuck - AI explains complex concepts simply',
          'Build confidence with progressive difficulty',
          'Track your understanding in real-time'
        ],
        icon: Lightbulb
      }
    },
    {
      icon: MessageCircle,
      title: 'Personal AI Tutor',
      description: 'Get instant help and explanations from your dedicated AI learning assistant',
      color: 'from-purple-500 to-pink-600',
      detailedInfo: {
        overview: 'Your 24/7 AI tutor is always ready to help, explain concepts, and guide you through your AI learning journey.',
        keyFeatures: [
          'Natural language conversations about AI topics',
          'Contextual help based on your current progress',
          'Detailed explanations with examples',
          'Study tips and learning strategies',
          'Unlimited questions and clarifications'
        ],
        benefits: [
          'Get help anytime, anywhere',
          'No judgment - ask anything you want',
          'Personalized explanations for your level',
          'Build deeper understanding through dialogue'
        ],
        icon: MessageCircle
      }
    },
    {
      icon: Trophy,
      title: 'Gamified Progress',
      description: 'Earn XP, maintain streaks, and compete on leaderboards while learning',
      color: 'from-green-500 to-blue-500',
      detailedInfo: {
        overview: 'Transform learning into an engaging game with rewards, achievements, and friendly competition.',
        keyFeatures: [
          'XP points for every correct answer',
          'Daily streak tracking and rewards',
          'Achievement badges and milestones',
          'Global and friend leaderboards',
          'Level progression system'
        ],
        benefits: [
          'Stay motivated with visible progress',
          'Build consistent learning habits',
          'Compete with friends and peers',
          'Celebrate your achievements'
        ],
        icon: Gamepad2
      }
    },
    {
      icon: Target,
      title: 'Personalized Path',
      description: 'Questions tailored to your age, experience level, and learning progress',
      color: 'from-orange-500 to-red-500',
      detailedInfo: {
        overview: 'Every learner is unique. Our AI creates a customized learning path that evolves with your progress and interests.',
        keyFeatures: [
          'Age-appropriate content and examples',
          'Skill level assessment and adaptation',
          'Learning style optimization',
          'Progress-based content unlocking',
          'Weakness identification and targeted practice'
        ],
        benefits: [
          'Learn at your optimal pace',
          'Focus on areas that need improvement',
          'Build strong foundations before advancing',
          'Maximize learning efficiency'
        ],
        icon: Compass
      }
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science Student',
      content: 'AI Implementor made complex AI concepts so much easier to understand. The interactive questions and AI tutor helped me ace my machine learning course!',
      rating: 5,
      avatar: 'SC'
    },
    {
      name: 'Marcus Johnson',
      role: 'Software Developer',
      content: 'Perfect for professionals wanting to upskill in AI. The gamification keeps me motivated, and I love competing on the leaderboard!',
      rating: 5,
      avatar: 'MJ'
    },
    {
      name: 'Emma Rodriguez',
      role: 'High School Student',
      content: 'Finally, an AI learning platform that adapts to my level! Started as a beginner and now I understand neural networks. Amazing!',
      rating: 5,
      avatar: 'ER'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Learners' },
    { number: '50,000+', label: 'Questions Answered' },
    { number: '95%', label: 'Success Rate' },
    { number: '4.9/5', label: 'User Rating' }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');

    try {
      await contactService.submitContactForm(contactForm as ContactSubmission);
      setContactSuccess(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => {
        setShowContactForm(false);
        setContactSuccess(false);
      }, 2000);
    } catch (error) {
      setContactError('Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI Implementor</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onSignIn}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-[1.02]"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-lg mb-8 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">🎉 Start your 7-day free trial today!</span>
            </button>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master AI Concepts
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Through Interactive Learning
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Learn artificial intelligence through gamified questions, get instant AI-powered explanations, 
              and track your progress with personalized learning paths designed for your skill level.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-[1.02] flex items-center space-x-2 shadow-lg"
              >
                <span>Start Learning Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI Implementor?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with proven learning methodologies 
              to create the most effective AI education experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
                  onClick={() => setSelectedFeature(index)}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 text-blue-600 font-medium text-sm">
                    Click to learn more →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes and begin your AI learning journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sign Up & Set Your Level</h3>
              <p className="text-gray-600">Create your account and tell us your experience level. We'll personalize everything for you.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Answer Interactive Questions</h3>
              <p className="text-gray-600">Engage with AI concepts through carefully crafted questions that adapt to your progress.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Learn & Level Up</h3>
              <p className="text-gray-600">Get instant AI explanations, earn XP, maintain streaks, and watch your AI knowledge grow!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Learners Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of successful AI learners worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Free, Upgrade When Ready
            </h2>
            <p className="text-xl text-gray-600">
              Try everything free for 7 days, then choose the plan that fits your learning goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <button
              onClick={onGetStarted}
              className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Trial</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>50 questions per day</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>10 AI chat messages</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>7 days free</span>
                </li>
              </ul>
            </button>
            
            <button
              onClick={() => handleUpgrade('professional', 'price_1S4kXUHdUmhkdYH4kJVGAxuV')}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-center text-white relative hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="text-4xl font-bold mb-4">€20</div>
              <p className="text-blue-100 mb-6">For serious learners</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>500 questions per day</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>100 AI chat messages</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </button>
            
            <button
              onClick={() => handleUpgrade('premium', 'price_1S4kYeHdUmhkdYH4b4fXVluo')}
              className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">€40</div>
              <p className="text-gray-600 mb-6">Unlimited everything</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Unlimited questions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Unlimited AI chat</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Team features</span>
                </li>
              </ul>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Master AI?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners who are already advancing their AI knowledge. 
            Start your free trial today and see the difference!
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg"
          >
            Start Your Free Trial Now
          </button>
          <p className="text-blue-200 mt-4">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">AI Implementor</span>
              </div>
              <p className="text-gray-400 mb-4">
                Master AI concepts through interactive learning and gamified progress tracking.
              </p>
              <div className="text-gray-400">
                © 2025 AI Implementor. All rights reserved.
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <a href="mailto:info@aiimplementer.io" className="text-gray-300 hover:text-white transition-colors">
                    info@aiimplementer.io
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <a href="tel:+33695329923" className="text-gray-300 hover:text-white transition-colors">
                    +33 6 95 32 99 23
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Started</h3>
              <div className="space-y-3">
                <button
                  onClick={onGetStarted}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={onSignIn}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Feature Detail Modal */}
      {selectedFeature !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${features[selectedFeature].color} rounded-2xl flex items-center justify-center`}>
                    {React.createElement(features[selectedFeature].detailedInfo.icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{features[selectedFeature].title}</h2>
                    <p className="text-gray-600">{features[selectedFeature].description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Overview */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Overview</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {features[selectedFeature].detailedInfo.overview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Key Features */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
                    Key Features
                  </h3>
                  <ul className="space-y-4">
                    {features[selectedFeature].detailedInfo.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-2 text-yellow-500" />
                    Benefits
                  </h3>
                  <ul className="space-y-4">
                    {features[selectedFeature].detailedInfo.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to experience {features[selectedFeature].title.toLowerCase()}?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start your free 7-day trial and discover how AI can transform your learning journey.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => {
                        setSelectedFeature(null);
                        onGetStarted();
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-[1.02]"
                    >
                      Start Free Trial
                    </button>
                    <button
                      onClick={() => setSelectedFeature(null)}
                      className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h2>
                  <p className="text-gray-600">We'd love to hear from you. Send us a message!</p>
                </div>
                <button
                  onClick={() => {
                    setShowContactForm(false);
                    setContactSuccess(false);
                    setContactError('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email Us</h3>
                      <p className="text-gray-600 text-sm">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  <a href="mailto:info@aiimplementer.io" className="text-blue-600 hover:text-blue-700 font-medium">
                    info@aiimplementer.io
                  </a>
                </div>

                <div className="bg-green-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Call Us</h3>
                      <p className="text-gray-600 text-sm">Mon-Fri 9AM-6PM CET</p>
                    </div>
                  </div>
                  <a href="tel:+33695329923" className="text-green-600 hover:text-green-700 font-medium">
                    +33 6 95 32 99 23
                  </a>
                </div>
              </div>

              {/* Success Message */}
              {contactSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <h4 className="font-semibold text-green-800">Message Sent Successfully!</h4>
                      <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>

                {contactError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{contactError}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={contactLoading || contactSuccess}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {contactLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactForm(false);
                      setContactSuccess(false);
                      setContactError('');
                    }}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;