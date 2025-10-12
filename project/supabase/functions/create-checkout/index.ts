interface CheckoutRequest {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

console.log('Environment check:', {
  hasStripeKey: !!STRIPE_SECRET_KEY,
  hasProjectUrl: !!Deno.env.get('project_url'),
  hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
});

// Price ID to plan mapping
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

    const { priceId, userId, userEmail, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    if (!priceId || !userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('project_url') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get or create Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userData?.stripe_customer_id) {
      customerId = userData.stripe_customer_id;
    } else {
      // Create new Stripe customer
      try {
        const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email: userEmail,
            'metadata[user_id]': userId,
          }),
        });

        if (!customerResponse.ok) {
          const errorText = await customerResponse.text();
          console.error('Stripe customer creation failed:', errorText);
          throw new Error(`Failed to create Stripe customer: ${customerResponse.status} ${errorText}`);
        }

        const customer = await customerResponse.json();
        customerId = customer.id;
      } catch (error) {
        console.error('Error creating Stripe customer:', error);
        throw new Error(`Failed to create Stripe customer: ${error.message}`);
      }

      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'customer': customerId,
        'payment_method_types[]': 'card',
        'mode': 'subscription',
        'line_items[][price]': priceId,
        'line_items[][quantity]': '1',
        'success_url': successUrl,
        'cancel_url': cancelUrl,
        'metadata[user_id]': userId,
        'metadata[plan]': PRICE_TO_PLAN_MAP[priceId] || 'unknown',
      }),
    });

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.text();
      console.error('Stripe session creation failed:', errorData);
      throw new Error('Failed to create checkout session');
    }

    const session = await sessionResponse.json();

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Checkout creation error:', error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});