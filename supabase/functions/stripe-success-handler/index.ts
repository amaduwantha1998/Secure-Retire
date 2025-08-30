import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing Stripe success callback");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Authentication required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("User authentication failed:", userError);
      return new Response(JSON.stringify({ 
        success: false,
        error: "User not authenticated" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    console.log("Processing success for user:", user.id, user.email);

    // Update subscription status - assuming payment was successful
    const { error: subscriptionError } = await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan_type: "pro",
        payment_status: "active",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (subscriptionError) {
      console.error("Error updating subscription:", subscriptionError);
    } else {
      console.log("Subscription updated successfully for user:", user.id);
    }

    // Update credits to unlimited
    const { error: creditsError } = await supabaseClient
      .from("credits")
      .upsert({
        user_id: user.id,
        available_credits: 999999, // Effectively unlimited
        used_credits: 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (creditsError) {
      console.error("Error updating credits:", creditsError);
    } else {
      console.log("Credits updated to unlimited for user:", user.id);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Subscription activated successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing Stripe success:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});