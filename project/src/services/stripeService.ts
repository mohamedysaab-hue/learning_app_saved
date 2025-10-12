import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface CheckoutOptions {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const stripeService = {
  async createCheckoutSession(options: CheckoutOptions) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating checkout session with options:', options);

      // Create checkout session via Supabase edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: options.priceId,
          userId: options.userId,
          userEmail: options.userEmail,
          successUrl: options.successUrl || `${window.location.origin}/dashboard?success=true`,
          cancelUrl: options.cancelUrl || `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.error('Checkout creation failed (JSON):', errorDetails);
        } catch {
          errorDetails = await response.text();
          console.error('Checkout creation failed (Text):', errorDetails);
        }
        throw new Error(`Failed to create checkout session: ${response.status} - ${JSON.stringify(errorDetails)}`);
      }

      const responseData = await response.json();
      console.log('Full response data:', responseData);
      
      // Handle both sessionId and direct URL responses
      if (responseData.url) {
        // Direct redirect to Stripe checkout URL
        console.log('Redirecting to Stripe checkout URL:', responseData.url);
        // Create a temporary link and click it to avoid popup blockers
        const link = document.createElement('a');
        link.href = responseData.url;
        link.target = '_self';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Fallback: try window.location after a short delay
        setTimeout(() => {
          if (window.location.href === window.location.href) {
            console.log('Fallback: using window.location.href');
            window.location.href = responseData.url;
          }
        }, 1000);
        return;
      }
      
      if (!responseData.sessionId) {
        console.error('No sessionId or URL in response:', responseData);
        throw new Error('No session ID or checkout URL returned from checkout creation');
      }
      
      const { sessionId } = responseData;
      console.log('Received session ID:', sessionId);
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      console.log('Redirecting to Stripe with session ID:', sessionId);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe redirect error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  async createCustomerPortalSession() {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  async getSubscriptionStatus() {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }
};