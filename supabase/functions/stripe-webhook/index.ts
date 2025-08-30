import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Stripe webhook received");

    // Get Stripe secret key and webhook secret
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      // Verify webhook signature in production
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // In development, parse body directly
      event = JSON.parse(body);
    }

    console.log("Event type:", event.type);

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);

        const userId = session.metadata?.user_id;
        if (!userId) {
          console.error("No user_id in session metadata");
          break;
        }

        // Update subscription in database
        const { error: subscriptionError } = await supabaseClient
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan_type: "pro",
            payment_status: "completed",
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (subscriptionError) {
          console.error("Error updating subscription:", subscriptionError);
        } else {
          console.log("Subscription updated successfully for user:", userId);
        }

        // Update credits to unlimited
        const { error: creditsError } = await supabaseClient
          .from("credits")
          .upsert({
            user_id: userId,
            available_credits: 999999, // Effectively unlimited
            used_credits: 0,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (creditsError) {
          console.error("Error updating credits:", creditsError);
        } else {
          console.log("Credits updated to unlimited for user:", userId);
        }

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated/deleted:", subscription.id);

        // Find user by customer ID
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (customer.deleted) {
          console.error("Customer was deleted");
          break;
        }

        const userId = customer.metadata?.supabase_user_id;
        if (!userId) {
          console.error("No supabase_user_id in customer metadata");
          break;
        }

        const isActive = subscription.status === "active";
        const planType = isActive ? "pro" : "free";

        // Update subscription status
        const { error: subscriptionError } = await supabaseClient
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan_type: planType,
            payment_status: isActive ? "completed" : "canceled",
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
            start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (subscriptionError) {
          console.error("Error updating subscription:", subscriptionError);
        }

        // Update credits based on plan
        const { error: creditsError } = await supabaseClient
          .from("credits")
          .upsert({
            user_id: userId,
            available_credits: isActive ? 999999 : 100, // Unlimited for pro, 100 for free
            used_credits: 0,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (creditsError) {
          console.error("Error updating credits:", creditsError);
        }

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});