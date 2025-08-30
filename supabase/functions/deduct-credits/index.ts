import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeductCreditsRequest {
  amount: number;
  feature_name: string;
  description: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    const { amount, feature_name, description }: DeductCreditsRequest = await req.json();

    console.log(`Deducting ${amount} credits for user ${user.id} - Feature: ${feature_name}`);

    // Check if user is Pro (unlimited credits)
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_type, payment_status")
      .eq("user_id", user.id)
      .eq("payment_status", "active")
      .maybeSingle();

    if (subError) {
      console.error("Error checking subscription:", subError);
    }

    // Pro users have unlimited access
    if (subscription?.plan_type === "pro") {
      console.log("Pro user - no credit deduction needed");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Pro user - unlimited access",
          remaining_credits: -1, // Indicates unlimited
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get current credit balance
    const { data: credits, error: creditsError } = await supabaseAdmin
      .from("credits")
      .select("available_credits, used_credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsError) {
      console.error("Error fetching credits:", creditsError);
      throw new Error("Failed to fetch credit balance");
    }

    if (!credits) {
      throw new Error("No credit record found for user");
    }

    const remainingCredits = credits.available_credits - credits.used_credits;

    // Check if user has enough credits
    if (remainingCredits < amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Insufficient credits",
          required: amount,
          available: remainingCredits,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Deduct credits by updating used_credits
    const newUsedCredits = credits.used_credits + amount;
    const { error: updateError } = await supabaseAdmin
      .from("credits")
      .update({
        used_credits: newUsedCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      throw new Error("Failed to deduct credits");
    }

    // Log the transaction (optional - could create a credit_transactions table)
    console.log(`Credits deducted successfully - User: ${user.id}, Amount: ${amount}, Feature: ${feature_name}`);

    const newRemainingCredits = credits.available_credits - newUsedCredits;

    return new Response(
      JSON.stringify({
        success: true,
        message: `${amount} credit${amount > 1 ? 's' : ''} deducted successfully`,
        remaining_credits: newRemainingCredits,
        feature_name,
        description,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in deduct-credits function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});