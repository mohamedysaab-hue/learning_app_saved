import React from 'react';
import { Check, Crown, Zap, Gift, ArrowLeft, ExternalLink } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { stripeService } from '../services/stripeService';
import { User } from '../types';

interface PricingScreenProps {
  user?: User;
  supabaseAuthUser?: SupabaseUser;
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ user, supabaseAuthUser, onNavigate, onSignOut }) => {
  const [loading, setLoading] = React.useState<string | null>(null);

  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '7 days',
      description: 'Perfect for trying out AI Implementor',
      icon: Gift,
      color: 'green',
      features: [
        '50 AI questions per day',
        '10 AI chat messages per day',
        'Basic progress tracking',
        'All difficulty levels',
        '7-day trial period'
      ],
      limitations: [
        'Limited daily usage',
        'Trial expires after 7 days'
      ],
      buttonText: 'Current Plan',
      buttonAction: () => {},
      popular: false
    },
    {
      name: 'Professional',
      price: '€20',
      period: 'month',
      description: 'For serious AI learners and professionals',
      icon: Zap,
      color: 'blue',
      features: [
        '500 AI questions per day',
        '100 AI chat messages per day',
        'Advanced progress analytics',
        'Priority support',
        'Custom learning paths',
        'Export progress reports'
      ],
      limitations: [],
      buttonText: 'Upgrade to Professional',
      buttonAction: () => handleUpgrade('professional', 'price_1S4kXUHdUmhkdYH4kJVGAxuV'),
      popular: true
    },
    {
      name: 'Premium',
      price: '€40',
      period: 'month',
      description: 'Unlimited access for power users and teams',
      icon: Crown,
      color: 'purple',
      features: [
        'Unlimited AI questions',
        'Unlimited AI chat messages',
        'Advanced analytics dashboard',
        'Priority support',
        'Custom learning paths',
        'Export progress reports',
        'Team collaboration features',
        'API access',
        'White-label options'
      ],
      limitations: [],
      buttonText: 'Upgrade to Premium',
      buttonAction: () => handleUpgrade('premium', 'price_1S4kYeHdUmhkdYH4b4fXVluo'),
      popular: false
    }
  ];

  const handleUpgrade = async (plan: string, priceId: string) => {
    if (!user || !supabaseAuthUser) {
      onNavigate('auth');
      return;
    }

    setLoading(plan);
    try {
      console.log('Starting checkout for plan:', plan, 'priceId:', priceId);
      await stripeService.createCheckoutSession({
        priceId,
        userId: supabaseAuthUser.id,
        userEmail: supabaseAuthUser.email || '',
      });
      console.log('Checkout session created successfully');
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert(`Failed to start checkout: ${error.message}. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user || !supabaseAuthUser) return;
    
    setLoading('manage');
    try {
      await stripeService.createCustomerPortalSession();
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('Failed to open subscription management. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'button') => {
    const colors = {
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        button: 'bg-green-500 hover:bg-green-600'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        button: 'bg-purple-500 hover:bg-purple-600'
      }
    };
    return colors[color as keyof typeof colors][type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Pricing Plans</h1>
            <p className="text-sm text-gray-600">Choose the perfect plan for your learning journey</p>
          </div>
          <button
            onClick={onSignOut}
            className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with our free trial and upgrade when you're ready to accelerate your AI learning journey
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-white rounded-3xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                } transition-all hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${getColorClasses(plan.color, 'bg')} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`w-8 h-8 ${getColorClasses(plan.color, 'text')}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-center space-x-3">
                            <div className="w-5 h-5 border-2 border-orange-400 rounded-full flex-shrink-0 flex items-center justify-center">
                              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            </div>
                            <span className="text-gray-600">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={plan.buttonAction}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    plan.name === 'Free Trial'
                      ? 'bg-gray-400 cursor-default text-white'
                      : `${getColorClasses(plan.color, 'button')} text-white hover:scale-[1.02] active:scale-[0.98]`
                  } flex items-center justify-center space-x-2`}
                  disabled={plan.name === 'Free Trial' || loading === plan.name.toLowerCase()}
                >
                  {loading === plan.name.toLowerCase() ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.buttonText}</span>
                      {plan.name !== 'Free Trial' && <ExternalLink className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens after my free trial?</h4>
              <p className="text-gray-600">
                After 7 days, you'll need to upgrade to a paid plan to continue using AI Implementor. 
                Your progress and data will be saved.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and other payment methods through Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a refund policy?</h4>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          {user && user.subscriptionPlan !== 'free_trial' && (
            <div className="mb-8">
              <button
                onClick={handleManageSubscription}
                disabled={loading === 'manage'}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all hover:scale-[1.02] flex items-center space-x-2 mx-auto"
              >
                {loading === 'manage' ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Manage Subscription</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Update payment method, view invoices, or cancel subscription
              </p>
            </div>
          )}
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to accelerate your AI learning?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of learners who are mastering AI concepts with our interactive platform.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-[1.02]"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingScreen;