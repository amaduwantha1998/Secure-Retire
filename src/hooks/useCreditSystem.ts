import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { toast } from 'sonner';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';

export interface CreditOperation {
  feature: string;
  cost: number;
  description: string;
}

// Credit costs for different features
export const CREDIT_COSTS = {
  AI_INSIGHT: 1,
  RETIREMENT_CALCULATION: 1,
  INVESTMENT_RECOMMENDATION: 2,
  DOCUMENT_GENERATION: 3,
  AI_CONSULTATION: 5,
  PORTFOLIO_ANALYSIS: 2,
  TAX_ESTIMATION: 1,
  WILL_GENERATION: 5,
  FINANCIAL_ADVICE: 2,
  TRANSLATION: 1,
} as const;

export const useCreditSystem = () => {
  const { user } = useAuth();
  const { t: translateText } = useRealTimeTranslation();
  const queryClient = useQueryClient();
  const {
    isProUser,
    remainingCredits,
    isCreditsEmpty,
    isLoading,
    refetch
  } = useSubscriptionData();

  const [isDeducting, setIsDeducting] = useState(false);

  // Check if user can perform an operation
  const canPerformOperation = useCallback((cost: number): boolean => {
    if (isLoading) return false;
    if (isProUser) return true; // Pro users have unlimited access
    return remainingCredits >= cost;
  }, [isProUser, remainingCredits, isLoading]);

  // Deduct credits for an operation
  const deductCredits = useCallback(async (operation: CreditOperation): Promise<boolean> => {
    if (!user) {
      toast.error(translateText('credits.login_required', 'Please log in to continue'));
      return false;
    }

    // Pro users don't need to deduct credits
    if (isProUser) {
      return true;
    }

    // Check if user has enough credits
    if (!canPerformOperation(operation.cost)) {
      toast.error(translateText('credits.insufficient', 'Insufficient credits'));
      return false;
    }

    setIsDeducting(true);
    try {
// Update the useCreditSystem hook to use the deduct-credits edge function
// TODO: Uncomment after applying database schema and deploying edge function
/*
const { error } = await supabase.functions.invoke('deduct-credits', {
  body: {
    amount: operation.cost,
    feature_name: operation.feature,
    description: operation.description
  }
});

if (error) {
  console.error('Error deducting credits:', error);
  toast.error(translateText('credits.deduction_failed', 'Failed to deduct credits'));
  return false;
}
*/

      // Mock implementation for now
      console.log(`Would deduct ${operation.cost} credits for ${operation.feature}`);
      
      // Invalidate queries to refresh credit display
      queryClient.invalidateQueries({ queryKey: ['credits', user.id] });
      
      toast.success(translateText('credits.deducted', `${operation.cost} credit${operation.cost > 1 ? 's' : ''} used`));
      
      // Refetch subscription data
      setTimeout(() => {
        refetch();
      }, 500);

      return true;
    } catch (error) {
      console.error('Credit deduction error:', error);
      toast.error(translateText('credits.error', 'Credit system error'));
      return false;
    } finally {
      setIsDeducting(false);
    }
  }, [user, isProUser, canPerformOperation, queryClient, translateText, refetch]);

  // Check credits before operation with user-friendly messaging
  const checkCreditsBeforeOperation = useCallback((operation: CreditOperation): boolean => {
    if (isProUser) return true;

    if (isCreditsEmpty) {
      toast.error(translateText('credits.no_credits', 'No credits remaining. Upgrade to Pro for unlimited access.'));
      return false;
    }

    if (!canPerformOperation(operation.cost)) {
      toast.error(translateText('credits.not_enough', `Need ${operation.cost} credit${operation.cost > 1 ? 's' : ''} for this feature. You have ${remainingCredits} remaining.`));
      return false;
    }

    return true;
  }, [isProUser, isCreditsEmpty, canPerformOperation, remainingCredits, translateText]);

  // Get credit status message
  const getCreditStatusMessage = useCallback((cost: number): string => {
    if (isLoading) return translateText('credits.checking', 'Checking credits...');
    if (isProUser) return translateText('credits.unlimited', 'Unlimited access');
    if (isCreditsEmpty) return translateText('credits.no_credits', 'No credits remaining');
    if (!canPerformOperation(cost)) {
      return translateText('credits.insufficient_for_action', `Need ${cost} credit${cost > 1 ? 's' : ''}, have ${remainingCredits}`);
    }
    return translateText('credits.will_use', `Will use ${cost} credit${cost > 1 ? 's' : ''}`);
  }, [isLoading, isProUser, isCreditsEmpty, canPerformOperation, remainingCredits, translateText]);

  return {
    // Status
    isProUser,
    remainingCredits,
    isCreditsEmpty,
    isLoading,
    isDeducting,

    // Operations
    canPerformOperation,
    deductCredits,
    checkCreditsBeforeOperation,
    getCreditStatusMessage,

    // Utils
    refetch,
  };
};