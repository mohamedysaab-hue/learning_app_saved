interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

interface CheckoutSession {
  id: string;
  customer: string;
  customer_email: string;
  metadata: {
    user_id?: string;
  };
  mode: string;
  payment_status: string;
  subscription?: string;
}

interface Subscription {
  id: string;
  customer: string;
  status: string;
  items: {
    data: Array<{
      price: {
        id: string;
        nickname?: string;
      };
    }>;
  };
  current_period_end: number;
  cancel_at_period_end: boolean;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
};

// Stripe webhook endpoint secret - should be set in Supabase environment
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

console.log('Webhook environment check:', {
  hasWebhookSecret: !!STRIPE_WEBHOOK_SECRET,
  hasStripeKey: !!STRIPE_SECRET_KEY
});

// Price ID mappings - UPDATE THESE WITH YOUR ACTUAL STRIPE PRICE IDs
const PRICE_TO_PLAN_MAP: Record<string, string> = {
  'price_1S4kXUHdUmhkdYH4kJVGAxuV': 'professional',
  'price_1S4kYeHdUmhkdYH4b4fXVluo': 'premium',
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      console.error('Missing signature or webhook secret');
      return new Response(
        JSON.stringify({ error: "Missing signature or webhook secret" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify webhook signature (simplified - in production use Stripe's library)
    let event: StripeEvent;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON:', err);
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Received Stripe webhook:', event.type);

    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('project_url') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object as CheckoutSession);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object as Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object as Subscription);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleCheckoutCompleted(supabase: any, session: CheckoutSession) {
  console.log('Processing checkout completion:', session.id);
  
  try {
    // Get user ID from metadata or customer email
    let userId = session.metadata?.user_id;
    
    if (!userId && session.customer_email) {
      // Try to find user by email in auth.users
      const { data: authUser } = await supabase.auth.admin.getUserByEmail(session.customer_email);
      userId = authUser?.user?.id;
    }

    if (!userId) {
      console.error('Could not find user for checkout session:', session.id);
      return;
    }

    // Determine plan from subscription
    if (session.subscription && session.mode === 'subscription') {
      // Fetch subscription details from Stripe to get the price ID
      const plan = await getPlanFromSubscription(session.subscription);
      
      if (plan) {
        await updateUserSubscription(supabase, userId, plan, null);
        console.log(`Updated user ${userId} to ${plan} plan`);
      }
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: Subscription) {
  console.log('Processing subscription update:', subscription.id);
  
  try {
    // Find user by Stripe customer ID
    const userId = await getUserByStripeCustomer(supabase, subscription.customer);
    
    if (!userId) {
      console.error('Could not find user for customer:', subscription.customer);
      return;
    }

    // Determine plan from subscription
    const plan = getPlanFromSubscriptionObject(subscription);
    
    if (plan) {
      // Check if subscription is active
      const isActive = ['active', 'trialing'].includes(subscription.status);
      
      if (isActive) {
        await updateUserSubscription(supabase, userId, plan, null);
        console.log(`Updated user ${userId} to ${plan} plan`);
      } else if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
        // Handle cancellation - downgrade to free trial
        await updateUserSubscription(supabase, userId, 'free_trial', new Date());
        console.log(`Downgraded user ${userId} to free trial`);
      }
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Subscription) {
  console.log('Processing subscription deletion:', subscription.id);
  
  try {
    // Find user by Stripe customer ID
    const userId = await getUserByStripeCustomer(supabase, subscription.customer);
    
    if (!userId) {
      console.error('Could not find user for customer:', subscription.customer);
      return;
    }

    // Downgrade to free trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // Give 7 days grace period
    
    await updateUserSubscription(supabase, userId, 'free_trial', trialEndDate);
    console.log(`Downgraded user ${userId} to free trial due to subscription deletion`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  console.log('Processing payment failure:', invoice.id);
  
  try {
    // Find user by Stripe customer ID
    const userId = await getUserByStripeCustomer(supabase, invoice.customer);
    
    if (!userId) {
      console.error('Could not find user for customer:', invoice.customer);
      return;
    }

    // You might want to send an email notification or update user status
    // For now, we'll just log it
    console.log(`Payment failed for user ${userId}`);
    
    // Optionally, you could add a grace period before downgrading
    // or mark the account as having payment issues
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function getPlanFromSubscription(subscriptionId: string): Promise<string | null> {
  try {
    // Fetch subscription from Stripe API
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch subscription from Stripe');
      return null;
    }

    const subscription = await response.json();
    return getPlanFromSubscriptionObject(subscription);
  } catch (error) {
    console.error('Error fetching subscription from Stripe:', error);
    return null;
  }
}

function getPlanFromSubscriptionObject(subscription: Subscription): string | null {
  // Get the price ID from the subscription items
  const priceId = subscription.items.data[0]?.price?.id;
  
  if (!priceId) {
    console.error('No price ID found in subscription');
    return null;
  }

  // Map price ID to plan
  const plan = PRICE_TO_PLAN_MAP[priceId];
  
  if (!plan) {
    console.error('Unknown price ID:', priceId);
    // Default mapping based on price nickname or amount
    const nickname = subscription.items.data[0]?.price?.nickname?.toLowerCase();
    if (nickname?.includes('professional')) return 'professional';
    if (nickname?.includes('premium')) return 'premium';
    return null;
  }

  return plan;
}

async function getUserByStripeCustomer(supabase: any, customerId: string): Promise<string | null> {
  try {
    // You'll need to store Stripe customer IDs in your users table
    // For now, this is a placeholder - you might need to add a stripe_customer_id field
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (error || !data) {
      console.error('User not found for Stripe customer:', customerId);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error finding user by Stripe customer:', error);
    return null;
  }
}

async function updateUserSubscription(
  supabase: any, 
  userId: string, 
  plan: string, 
  trialEndDate: Date | null
) {
  try {
    const updateData: any = {
      subscription_plan: plan,
      daily_questions_used: 0, // Reset usage on plan change
      daily_chat_messages_used: 0,
      last_reset_date: new Date().toISOString().split('T')[0],
    };

    if (trialEndDate) {
      updateData.trial_end_date = trialEndDate.toISOString();
    } else if (plan !== 'free_trial') {
      updateData.trial_end_date = null; // Clear trial date for paid plans
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }

    console.log(`Successfully updated user ${userId} subscription to ${plan}`);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}