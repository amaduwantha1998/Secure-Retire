import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';
import { SubscriptionModal } from './SubscriptionModal';
import { SubscriptionConfirmModal } from './SubscriptionConfirmModal';
import { SubscriptionSuccessModal } from './SubscriptionSuccessModal';
import { StripeDebugPanel } from './StripeDebugPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logError } from '@/utils/sentry';

interface SubscriptionTabProps {
  onUpdate: () => void;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ onUpdate }) => {
  const { 
    accountType, 
    isProUser, 
    availableCredits, 
    usedCredits, 
    remainingCredits, 
    isCreditsLow, 
    isCreditsEmpty, 
    isLoading,
    subscription,
    refetch 
  } = useSubscriptionData();
  const { formatAmount } = useCurrency();
  const { t: translateText } = useRealTimeTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'upgrade' | 'downgrade' | 'cancel'>('upgrade');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Check for successful payment redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      // Call the success handler to update subscription
      handlePaymentSuccess();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname + '?tab=subscription');
    }
  }, []);

  const handlePaymentSuccess = async () => {
    try {
      console.log('Processing payment success...');
      
      // Call success handler edge function to update subscription
      const { data, error } = await supabase.functions.invoke('stripe-success-handler');
      
      if (error) {
        console.error('Error processing payment success:', error);
        toast.error('Payment was successful but there was an issue updating your account. Please contact support.');
      } else {
        console.log('Payment success processed:', data);
        // Refresh subscription data
        refetch();
        onUpdate();
        toast.success('Welcome to Pro! Your account has been upgraded.');
        
        // Redirect to dashboard with success parameter
        setTimeout(() => {
          window.location.href = '/dashboard?upgrade=success';
        }, 1500);
      }
    } catch (error) {
      console.error('Error in payment success handler:', error);
      toast.error('Payment was successful but there was an issue updating your account. Please contact support.');
    }
  };

  const handleUpgradeClick = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    setPaymentLoading(true);
    try {
      console.log('Starting Stripe checkout process...');
      
      // Use the provided Stripe payment link directly
      // https://buy.stripe.com/test_8x2dRagvXaIh1edccJ77O01
      const stripePaymentUrl = 'https://buy.stripe.com/test_8x2dRagvXaIh1edccJ77O01';
      
      console.log('Redirecting to Stripe payment link:', stripePaymentUrl);
      
      // Close confirmation modal
      setConfirmModalOpen(false);
      
      // Redirect to Stripe payment link
      window.location.href = stripePaymentUrl;
      
    } catch (error) {
      console.error('Upgrade error:', error);
      logError(error instanceof Error ? error : new Error(String(error)), { 
        context: 'subscription_upgrade_flow' 
      });
      toast.error(translateText('subscription.upgrade_error', 'Failed to initiate upgrade. Please try again.'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDowngrade = () => {
    setModalType('downgrade');
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalType('cancel');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    refetch();
    onUpdate();
  };

  const getStatusBadge = () => {
    if (isProUser) {
      return (
        <Badge 
          variant="default" 
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white backdrop-blur-md"
        >
          <Crown className="h-3 w-3 mr-1" />
          {translateText('subscription.pro_plan', 'Pro Plan')}
        </Badge>
      );
    }
    return (
      <Badge 
        variant="secondary" 
        className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30"
      >
        {translateText('subscription.free_plan', 'Free Plan')}
      </Badge>
    );
  };

  const getCreditStatus = () => {
    if (isProUser) {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4 mr-2" />
          {translateText('subscription.unlimited_credits', 'Unlimited Credits')}
        </div>
      );
    }

    const progressValue = (remainingCredits / availableCredits) * 100;
    const statusColor = isCreditsEmpty ? 'text-red-600 dark:text-red-400' : 
                      isCreditsLow ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-green-600 dark:text-green-400';

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {translateText('subscription.credits_remaining', 'Credits Remaining')}
          </span>
          <span className={`text-sm font-bold ${statusColor}`}>
            {remainingCredits} / {availableCredits}
          </span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-2"
        />
        {(isCreditsLow || isCreditsEmpty) && (
          <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            {isCreditsEmpty 
              ? translateText('subscription.no_credits_warning', 'No credits remaining! Upgrade to continue using AI features.')
              : translateText('subscription.low_credits_warning', 'Running low on credits. Consider upgrading to Pro.')
            }
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-white/20 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Current Plan */}
        <Card className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-white/20 shadow-lg rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {translateText('subscription.current_plan', 'Current Plan')}
              </CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {isProUser 
                      ? translateText('subscription.pro_features', 'Pro Features') 
                      : translateText('subscription.free_features', 'Free Features')
                    }
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {isProUser ? (
                      <>
                        <li>✓ {translateText('subscription.unlimited_ai', 'Unlimited AI features')}</li>
                        <li>✓ {translateText('subscription.priority_support', 'Priority support')}</li>
                        <li>✓ {translateText('subscription.advanced_analytics', 'Advanced analytics')}</li>
                        <li>✓ {translateText('subscription.document_generation', 'Document generation')}</li>
                        <li>✓ {translateText('subscription.consultation_booking', 'Consultation booking')}</li>
                      </>
                    ) : (
                      <>
                        <li>✓ {translateText('subscription.basic_features', 'Basic financial tracking')}</li>
                        <li>✓ {translateText('subscription.limited_ai', '100 AI credits per month')}</li>
                        <li>✓ {translateText('subscription.community_support', 'Community support')}</li>
                        <li className="text-muted-foreground/60">✗ {translateText('subscription.advanced_features', 'Advanced features')}</li>
                        <li className="text-muted-foreground/60">✗ {translateText('subscription.unlimited_access', 'Unlimited access')}</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Subscription Details */}
                {subscription && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {subscription.end_date 
                        ? `${translateText('subscription.expires_on', 'Expires on')} ${new Date(subscription.end_date).toLocaleDateString()}`
                        : translateText('subscription.no_expiry', 'No expiry date')
                      }
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {translateText('subscription.status', 'Status')}: {subscription.payment_status}
                    </div>
                  </div>
                )}
              </div>

              {/* Credits Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {translateText('subscription.credits_usage', 'Credits Usage')}
                </h3>
                {getCreditStatus()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
              {!isProUser ? (
                <Button 
                  onClick={handleUpgradeClick}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white backdrop-blur-md shadow-lg rounded-xl"
                  aria-label="Upgrade to Pro for Rs. 20"
                  tabIndex={0}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {translateText('subscription.upgrade_to_pro', 'Upgrade to Pro')} 
                  <span className="ml-2 font-semibold">$1.00/mo</span>
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleDowngrade}
                    className="flex-1 backdrop-blur-md bg-white/10 dark:bg-gray-800/20 border-white/20 hover:bg-white/20 rounded-xl"
                    aria-label="Downgrade to Free plan"
                    tabIndex={0}
                  >
                    {translateText('subscription.downgrade_to_free', 'Downgrade to Free')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 backdrop-blur-md bg-red-500/10 dark:bg-red-800/20 border-red-500/20 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl"
                    aria-label="Cancel subscription"
                    tabIndex={0}
                  >
                    {translateText('subscription.cancel_subscription', 'Cancel Subscription')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Usage Summary */}
        {!isProUser && (
          <Card className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-white/20 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">
                {translateText('subscription.monthly_usage', 'Monthly Usage Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{usedCredits}</div>
                  <div className="text-sm text-muted-foreground">
                    {translateText('subscription.credits_used', 'Credits Used')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{remainingCredits}</div>
                  <div className="text-sm text-muted-foreground">
                    {translateText('subscription.credits_remaining', 'Remaining')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{availableCredits}</div>
                  <div className="text-sm text-muted-foreground">
                    {translateText('subscription.total_credits', 'Total Credits')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <SubscriptionModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        type={modalType}
        currentPlan={accountType}
      />

      <SubscriptionConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmUpgrade}
        loading={paymentLoading}
      />

      <SubscriptionSuccessModal
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          refetch();
          onUpdate();
        }}
      />

      <StripeDebugPanel />
    </>
  );
};