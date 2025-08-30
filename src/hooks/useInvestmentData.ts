import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InvestmentOption {
  id: string;
  symbol: string;
  name: string;
  type: string;
  asset_class: string;
  expense_ratio: number;
  region: string;
  risk_level: number;
  description: string;
  performance_1y: number;
  performance_3y: number;
  performance_5y: number;
}

interface PortfolioAllocation {
  id: string;
  user_id: string;
  asset_class: string;
  target_percentage: number;
  current_percentage: number;
  rebalance_threshold: number;
}

interface RebalancingData {
  current_metrics: {
    expectedReturn: string;
    volatility: string;
    sharpeRatio: string;
    riskLevel: string;
  };
  recommendations: any[];
  improvement_potential: {
    return_improvement: string;
    risk_reduction: string;
    efficiency_gain: string;
  };
  market_outlook: {
    sentiment: string;
    key_factors: string[];
  };
}

export function useInvestmentData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch investment options
  const {
    data: investmentOptions,
    isLoading: investmentOptionsLoading,
    error: investmentOptionsError
  } = useQuery({
    queryKey: ['investment-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_options')
        .select('*')
        .order('asset_class, symbol');
      
      if (error) throw error;
      return data as InvestmentOption[];
    }
  });

  // Fetch user's portfolio allocations
  const {
    data: portfolioAllocations,
    isLoading: allocationsLoading,
    error: allocationsError
  } = useQuery({
    queryKey: ['portfolio-allocations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('portfolio_allocations')
        .select('*')
        .eq('user_id', user.id)
        .order('asset_class');
      
      if (error) throw error;
      return data as PortfolioAllocation[];
    },
    enabled: !!user?.id
  });

  // Fetch user's assets (for portfolio value calculation)
  const {
    data: userAssets,
    isLoading: assetsLoading,
    error: assetsError
  } = useQuery({
    queryKey: ['user-assets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['investment', 'retirement']);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Generate AI recommendations
  const {
    mutate: generateRecommendations,
    data: recommendations,
    isPending: recommendationsLoading,
    error: recommendationsError
  } = useMutation({
    mutationFn: async ({ riskTolerance = 3 }: { riskTolerance?: number } = {}) => {
      if (!user?.id) throw new Error('User not authenticated');

      const totalPortfolioValue = userAssets?.reduce((sum, asset) => sum + Number(asset.amount), 0) || 100000;

      const { data, error } = await supabase.functions.invoke('generate-investment-recommendations', {
        body: {
          user_id: user.id,
          risk_tolerance: riskTolerance,
          portfolio_value: totalPortfolioValue
        }
      });

      if (error) throw error;
      return data as RebalancingData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-allocations'] });
    }
  });

  // Add investment to portfolio
  const addToPortfolioMutation = useMutation({
    mutationFn: async ({ option, amount }: { option: InvestmentOption; amount: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Add as asset
      const { error: assetError } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          type: 'investment',
          amount: amount,
          institution_name: option.symbol,
          account_number: option.name
        });

      if (assetError) throw assetError;

      // Update or create portfolio allocation
      const existingAllocation = portfolioAllocations?.find(
        alloc => alloc.asset_class === option.asset_class
      );

      if (existingAllocation) {
        // Update existing allocation
        const totalValue = userAssets?.reduce((sum, asset) => sum + Number(asset.amount), 0) || 0;
        const newValue = totalValue + amount;
        const newPercentage = ((existingAllocation.current_percentage / 100 * totalValue) + amount) / newValue * 100;

        const { error: updateError } = await supabase
          .from('portfolio_allocations')
          .update({
            current_percentage: newPercentage
          })
          .eq('id', existingAllocation.id);

        if (updateError) throw updateError;
      } else {
        // Create new allocation
        const totalValue = (userAssets?.reduce((sum, asset) => sum + Number(asset.amount), 0) || 0) + amount;
        const percentage = (amount / totalValue) * 100;

        const { error: insertError } = await supabase
          .from('portfolio_allocations')
          .insert({
            user_id: user.id,
            asset_class: option.asset_class,
            target_percentage: percentage,
            current_percentage: percentage
          });

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['user-assets'] });
    }
  });

  // Apply rebalancing recommendations
  const applyRebalancingMutation = useMutation({
    mutationFn: async (recommendations: any[]) => {
      if (!user?.id) throw new Error('User not authenticated');

      for (const rec of recommendations) {
        const { error } = await supabase
          .from('portfolio_allocations')
          .upsert({
            user_id: user.id,
            asset_class: rec.asset_class,
            target_percentage: rec.target_percentage,
            current_percentage: rec.target_percentage // Simulate immediate rebalancing
          }, {
            onConflict: 'user_id,asset_class'
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-allocations'] });
    }
  });

  // Calculate portfolio overview data
  const portfolioOverview = {
    totalValue: userAssets?.reduce((sum, asset) => sum + Number(asset.amount), 0) || 0,
    dailyChange: Math.random() * 4 - 2, // Mock daily change
    totalReturn: Math.random() * 20 - 5, // Mock total return
    allocations: portfolioAllocations?.map(alloc => ({
      asset_class: alloc.asset_class,
      current_percentage: alloc.current_percentage,
      value: (alloc.current_percentage / 100) * (userAssets?.reduce((sum, asset) => sum + Number(asset.amount), 0) || 0)
    })) || [],
    performance: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 100000 + Math.random() * 20000 - 10000
    })),
    riskMetrics: recommendations?.current_metrics || {
      expectedReturn: '8.5',
      volatility: '12.3',
      sharpeRatio: '0.69',
      riskLevel: 'Medium'
    }
  };

  return {
    investmentOptions: investmentOptions || [],
    portfolioAllocations: portfolioAllocations || [],
    portfolioOverview,
    recommendations,
    loading: investmentOptionsLoading || allocationsLoading || assetsLoading,
    recommendationsLoading,
    generateRecommendations,
    addToPortfolio: addToPortfolioMutation.mutate,
    applyRebalancing: applyRebalancingMutation.mutate,
    addToPortfolioLoading: addToPortfolioMutation.isPending,
    applyRebalancingLoading: applyRebalancingMutation.isPending,
    error: investmentOptionsError || allocationsError || assetsError || recommendationsError
  };
}