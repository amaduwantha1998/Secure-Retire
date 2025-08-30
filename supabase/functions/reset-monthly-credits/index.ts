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
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log("Starting monthly credit reset...");

    // Get current date for reset calculation
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Find credits that need to be reset (reset_date has passed)
    const { data: creditsToReset, error: fetchError } = await supabaseAdmin
      .from("credits")
      .select(`
        *,
        subscriptions!inner(plan_type, end_date)
      `)
      .lte("reset_date", now.toISOString())
      .eq("subscriptions.plan_type", "free")
      .or("subscriptions.end_date.is.null,subscriptions.end_date.gt." + now.toISOString());

    if (fetchError) {
      console.error("Error fetching credits to reset:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${creditsToReset?.length || 0} users to reset credits for`);

    if (creditsToReset && creditsToReset.length > 0) {
      // Reset credits for eligible users
      const resetResults = await Promise.all(
        creditsToReset.map(async (credit) => {
          const { error } = await supabaseAdmin
            .from("credits")
            .update({
              available_credits: 100,
              used_credits: 0,
              reset_date: nextMonth.toISOString(),
              updated_at: now.toISOString()
            })
            .eq("user_id", credit.user_id);

          if (error) {
            console.error(`Error updating credits for user ${credit.user_id}:`, error);
            return { user_id: credit.user_id, success: false, error };
          }

          console.log(`Successfully reset credits for user ${credit.user_id}`);
          return { user_id: credit.user_id, success: true };
        })
      );

      const successful = resetResults.filter(r => r.success).length;
      const failed = resetResults.filter(r => !r.success).length;

      console.log(`Credit reset completed: ${successful} successful, ${failed} failed`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Monthly credit reset completed`,
          results: {
            total: creditsToReset.length,
            successful,
            failed,
            details: resetResults
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log("No credits needed to be reset");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No credits needed to be reset",
          results: { total: 0, successful: 0, failed: 0 }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error("Error in reset-monthly-credits function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});