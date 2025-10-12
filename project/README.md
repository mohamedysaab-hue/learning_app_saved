# AI Implementor Learning App

A gamified AI learning platform with interactive questions, AI tutoring, and subscription management.

## Features

- 🧠 **AI-Powered Learning** - Interactive questions adapted to skill level
- 💬 **Personal AI Tutor** - Get instant help and explanations
- 🏆 **Gamified Progress** - Earn XP, maintain streaks, compete on leaderboards
- 🎯 **Personalized Path** - Questions tailored to age and experience
- 💳 **Subscription Plans** - Free trial, Professional, and Premium tiers

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 2. Supabase Edge Functions Environment Variables

In your Supabase project dashboard, add these environment variables for Edge Functions:

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

### 3. Stripe Setup

1. **Create Products in Stripe Dashboard:**
   - Professional Plan: €20/month
   - Premium Plan: €40/month

2. **Get Price IDs and update these files:**
   - `supabase/functions/create-checkout/index.ts` (PRICE_TO_PLAN_MAP)
   - `supabase/functions/stripe-webhook/index.ts` (PRICE_TO_PLAN_MAP)
   - `src/components/PricingScreen.tsx` (buttonAction calls)
   - `src/components/LandingPage.tsx` (handleUpgrade calls)

3. **Set up Webhook Endpoint:**
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

### 4. Database Setup

The database migrations are already included. Make sure to run them in your Supabase project.

### 5. Development

```bash
npm install
npm run dev
```

## Subscription Plans

### Free Trial (7 days)
- 50 AI questions per day
- 10 AI chat messages per day
- Basic progress tracking

### Professional (€20/month)
- 500 AI questions per day
- 100 AI chat messages per day
- Advanced progress analytics
- Priority support

### Premium (€40/month)
- Unlimited AI questions
- Unlimited AI chat messages
- Advanced analytics dashboard
- Team collaboration features
- API access

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Payments**: Stripe
- **Authentication**: Supabase Auth
- **Deployment**: Vite build system

## Key Components

- `OnboardingScreen` - User registration and level selection
- `DashboardScreen` - Main learning hub with AI chat
- `GameScreen` - Interactive question interface
- `ProfileScreen` - User progress and achievements
- `LeaderboardScreen` - Global rankings
- `PricingScreen` - Subscription management
- `AuthScreen` - Login/signup interface
- `LandingPage` - Marketing and feature showcase

## Services

- `userService` - User data management and database operations
- `stripeService` - Payment processing and subscription management
- `contactService` - Contact form submissions

## Edge Functions

- `chat-gpt` - AI tutoring chat interface
- `create-checkout` - Stripe checkout session creation
- `create-portal-session` - Stripe customer portal access
- `get-subscription` - Subscription status checking
- `stripe-webhook` - Payment event processing