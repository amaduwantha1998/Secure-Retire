import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSubscriptionAPI, getCreditsAPI, SubscriptionData, CreditsData } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch subscription data
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: getSubscriptionAPI,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch credits data
  const creditsQuery = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: getCreditsAPI,
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for credits)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // TODO: Uncomment after applying database schema
    /*
    // Subscribe to subscription changes
    const subscriptionChannel = supabase
      .channel(`subscription-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Subscription updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
        }
      )
      .subscribe();

    // Subscribe to credits changes
    const creditsChannel = supabase
      .channel(`credits-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Credits updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['credits', user.id] });
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(subscriptionChannel);
      supabase.removeChannel(creditsChannel);
    };
    */
  }, [user?.id, queryClient]);

  // Derived data
  const isLoading = subscriptionQuery.isLoading || creditsQuery.isLoading;
  const isError = subscriptionQuery.isError || creditsQuery.isError;
  const error = subscriptionQuery.error || creditsQuery.error;

  const subscription = subscriptionQuery.data as SubscriptionData | null;
  const credits = creditsQuery.data as CreditsData | null;

  // Default values for new users (graceful fallbacks)
  const accountType = subscription?.plan_type || 'free';
  const isProUser = accountType === 'pro' && subscription?.payment_status === 'active';
  const availableCredits = credits?.available_credits || (isProUser ? 999999 : 100);
  const usedCredits = credits?.used_credits || 0;
  const remainingCredits = isProUser ? 999999 : Math.max(0, availableCredits - usedCredits);

  // Check if credits are running low
  const isCreditsLow = !isProUser && remainingCredits <= 10 && remainingCredits > 0;
  const isCreditsEmpty = !isProUser && remainingCredits <= 0;

  return {
    subscription,
    credits,
    accountType,
    isProUser,
    availableCredits,
    usedCredits,
    remainingCredits,
    isCreditsLow,
    isCreditsEmpty,
    isLoading,
    isError,
    error,
    refetch: () => {
      subscriptionQuery.refetch();
      creditsQuery.refetch();
    },
  };
};