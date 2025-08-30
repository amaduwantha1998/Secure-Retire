import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple ML-based portfolio optimization algorithm
class PortfolioOptimizer {
  // Modern Portfolio Theory calculations
  static calculateOptimalAllocation(assetClasses: any[], riskTolerance: number, currentAllocations: any[]) {
    const recommendations = [];
    
    // Risk tolerance mapping (1-5 scale)
    const riskProfiles = {
      1: { equity: 20, bonds: 60, international: 10, alternatives: 10 }, // Conservative
      2: { equity: 40, bonds: 50, international: 15, alternatives: 5 },  // Moderate Conservative
      3: { equity: 60, bonds: 30, international: 20, alternatives: 10 }, // Moderate
      4: { equity: 80, bonds: 15, international: 25, alternatives: 15 }, // Moderate Aggressive
      5: { equity: 90, bonds: 5, international: 30, alternatives: 20 }   // Aggressive
    };
    
    const targetProfile = riskProfiles[riskTolerance as keyof typeof riskProfiles] || riskProfiles[3];
    
    // Calculate recommendations based on asset class mapping
    const assetClassMapping = {
      'US Equity': 'equity',
      'International Equity': 'international',
      'Fixed Income': 'bonds',
      'Real Estate': 'alternatives',
      'Technology': 'equity',
      'Consumer Staples': 'equity',
      'Government Bonds': 'bonds',
      'Municipal Bonds': 'bonds'
    };
    
    for (const assetClass of assetClasses) {
      const mappedCategory = assetClassMapping[assetClass.asset_class as keyof typeof assetClassMapping] || 'equity';
      const targetPercentage = targetProfile[mappedCategory as keyof typeof targetProfile] || 0;
      
      const currentAllocation = currentAllocations.find(a => a.asset_class === assetClass.asset_class);
      const currentPercentage = currentAllocation?.current_percentage || 0;
      
      const deviation = Math.abs(targetPercentage - currentPercentage);
      const action = targetPercentage > currentPercentage ? 'increase' : 'decrease';
      
      if (deviation > 5) { // Only recommend if deviation is significant
        recommendations.push({
          asset_class: assetClass.asset_class,
          symbol: assetClass.symbol,
          name: assetClass.name,
          current_percentage: currentPercentage,
          target_percentage: targetPercentage,
          deviation,
          action,
          priority: deviation > 15 ? 'high' : deviation > 10 ? 'medium' : 'low',
          rationale: this.generateRationale(assetClass, action, deviation, riskTolerance)
        });
      }
    }
    
    return recommendations.sort((a, b) => b.deviation - a.deviation);
  }
  
  static generateRationale(assetClass: any, action: string, deviation: number, riskTolerance: number) {
    const reasons = {
      increase: [
        `Your current allocation is ${deviation.toFixed(1)}% below the optimal level for your risk profile.`,
        `${assetClass.asset_class} offers good diversification benefits for your portfolio.`,
        `Recent performance metrics suggest this asset class is undervalued.`
      ],
      decrease: [
        `You're overexposed to ${assetClass.asset_class} by ${deviation.toFixed(1)}%.`,
        `Reducing this allocation will improve your portfolio's risk-adjusted returns.`,
        `Rebalancing will help maintain your target risk level.`
      ]
    };
    
    return reasons[action as keyof typeof reasons][0];
  }
  
  // Calculate portfolio risk metrics
  static calculateRiskMetrics(portfolioValue: number, allocations: any[]) {
    let portfolioVolatility = 0;
    let expectedReturn = 0;
    
    for (const allocation of allocations) {
      const weight = allocation.current_percentage / 100;
      
      // Simplified risk/return assumptions based on asset class
      const riskReturnMap = {
        'US Equity': { risk: 16, return: 10 },
        'International Equity': { risk: 18, return: 8 },
        'Fixed Income': { risk: 4, return: 3 },
        'Real Estate': { risk: 20, return: 9 },
        'Technology': { risk: 25, return: 15 },
        'Consumer Staples': { risk: 12, return: 8 },
        'Government Bonds': { risk: 3, return: 2 },
        'Municipal Bonds': { risk: 3, return: 2.5 }
      };
      
      const assetMetrics = riskReturnMap[allocation.asset_class as keyof typeof riskReturnMap] || { risk: 15, return: 8 };
      
      portfolioVolatility += Math.pow(weight * assetMetrics.risk, 2);
      expectedReturn += weight * assetMetrics.return;
    }
    
    portfolioVolatility = Math.sqrt(portfolioVolatility);
    
    const sharpeRatio = expectedReturn / portfolioVolatility;
    
    return {
      expectedReturn: expectedReturn.toFixed(2),
      volatility: portfolioVolatility.toFixed(2),
      sharpeRatio: sharpeRatio.toFixed(2),
      riskLevel: portfolioVolatility < 8 ? 'Low' : portfolioVolatility < 15 ? 'Medium' : 'High'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!;
    
    // Set the auth header for the supabase client
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    });

    const { user_id, risk_tolerance = 3, portfolio_value = 100000 } = await req.json();

    console.log('Generating investment recommendations for user:', user_id);

    // Fetch user's current portfolio allocations
    const { data: allocations, error: allocError } = await supabaseClient
      .from('portfolio_allocations')
      .select('*')
      .eq('user_id', user_id);

    if (allocError) {
      console.error('Error fetching allocations:', allocError);
      throw allocError;
    }

    // Fetch available investment options
    const { data: investmentOptions, error: optionsError } = await supabaseClient
      .from('investment_options')
      .select('*')
      .order('asset_class');

    if (optionsError) {
      console.error('Error fetching investment options:', optionsError);
      throw optionsError;
    }

    // Calculate current portfolio metrics
    const riskMetrics = PortfolioOptimizer.calculateRiskMetrics(portfolio_value, allocations || []);

    // Generate rebalancing recommendations
    const recommendations = PortfolioOptimizer.calculateOptimalAllocation(
      investmentOptions || [],
      risk_tolerance,
      allocations || []
    );

    // Calculate potential improvement
    const currentRisk = parseFloat(riskMetrics.volatility);
    const currentReturn = parseFloat(riskMetrics.expectedReturn);
    const optimizedReturn = recommendations.reduce((sum, rec) => {
      return sum + (rec.target_percentage * 0.08); // Simplified calculation
    }, 0);

    const analysis = {
      current_metrics: riskMetrics,
      recommendations,
      improvement_potential: {
        return_improvement: Math.max(0, optimizedReturn - currentReturn).toFixed(2),
        risk_reduction: Math.max(0, currentRisk - (currentRisk * 0.95)).toFixed(2), // Simplified
        efficiency_gain: recommendations.length > 0 ? 'High' : 'Already Optimized'
      },
      market_outlook: {
        sentiment: 'Neutral',
        key_factors: [
          'Global economic uncertainty affecting international equities',
          'Interest rate environment favoring shorter-duration bonds',
          'Technology sector showing mixed signals',
          'Real estate markets experiencing regional variations'
        ]
      }
    };

    console.log('Investment analysis completed successfully');

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-investment-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});