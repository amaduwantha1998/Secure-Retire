import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, AlertTriangle, CreditCard, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'upgrade' | 'downgrade' | 'cancel';
  currentPlan: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  type,
  currentPlan,
}) => {
  const { formatAmount } = useCurrency();
  const { t: translateText } = useRealTimeTranslation();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    // Upgrade is now handled directly via static payment link in SubscriptionTab
    // This modal is only used for downgrade and cancel operations
    console.log('Upgrade should be handled via static payment link');
    onClose();
  };

  const handleDowngrade = async () => {
    setLoading(true);
    try {
      // TODO: Implement downgrade logic
      // This would typically involve:
      // 1. Updating the subscription status in the database
      // 2. Resetting credits to 100
      // 3. Cancelling any recurring payments
      
      console.log('Downgrading to free plan...');
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(translateText('subscription.downgrade_success', 'Successfully downgraded to Free plan'));
      onClose();
    } catch (error) {
      console.error('Subscription downgrade error:', error);
      toast.error(translateText('subscription.downgrade_error', 'Failed to downgrade subscription'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      // TODO: Implement cancellation logic
      // This would typically involve:
      // 1. Cancelling the subscription in the payment gateway
      // 2. Updating the subscription status to 'cancelled'
      // 3. Setting an end date for the subscription
      
      console.log('Cancelling subscription...');
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(translateText('subscription.cancel_success', 'Subscription cancelled successfully'));
      onClose();
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      toast.error(translateText('subscription.cancel_error', 'Failed to cancel subscription'));
    } finally {
      setLoading(false);
    }
  };

  const getModalContent = () => {
    switch (type) {
      case 'upgrade':
        return {
          icon: <Crown className="h-12 w-12 text-yellow-500" />,
          title: translateText('subscription.upgrade_to_pro', 'Upgrade to Pro'),
          description: translateText(
            'subscription.upgrade_description',
            'Unlock unlimited AI features, priority support, and advanced analytics for just {amount} per month.'
          ).replace('{amount}', formatAmount(20)),
          features: [
            translateText('subscription.unlimited_ai', 'Unlimited AI features'),
            translateText('subscription.priority_support', 'Priority support'),
            translateText('subscription.advanced_analytics', 'Advanced analytics'),
            translateText('subscription.document_generation', 'Document generation'),
            translateText('subscription.consultation_booking', 'Consultation booking'),
          ],
          action: handleUpgrade,
          actionText: translateText('subscription.upgrade_now', 'Upgrade Now'),
          actionIcon: <Crown className="h-4 w-4 mr-2" />,
          actionClass: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white',
        };

      case 'downgrade':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
          title: translateText('subscription.confirm_downgrade', 'Confirm Downgrade'),
          description: translateText(
            'subscription.downgrade_description',
            'Are you sure you want to downgrade to the Free plan? You will lose access to Pro features and be limited to 100 credits per month.'
          ),
          features: [
            translateText('subscription.lose_unlimited', 'Lose unlimited AI access'),
            translateText('subscription.lose_priority', 'Lose priority support'),
            translateText('subscription.limited_credits', 'Limited to 100 credits/month'),
            translateText('subscription.lose_advanced', 'Lose advanced features'),
          ],
          action: handleDowngrade,
          actionText: translateText('subscription.confirm_downgrade', 'Confirm Downgrade'),
          actionIcon: <AlertTriangle className="h-4 w-4 mr-2" />,
          actionClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        };

      case 'cancel':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          title: translateText('subscription.cancel_subscription', 'Cancel Subscription'),
          description: translateText(
            'subscription.cancel_description',
            'Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing cycle.'
          ),
          features: [
            translateText('subscription.access_until_end', 'Access until billing cycle ends'),
            translateText('subscription.no_refund', 'No refund for remaining time'),
            translateText('subscription.lose_pro_features', 'Lose all Pro features'),
            translateText('subscription.can_resubscribe', 'Can resubscribe anytime'),
          ],
          action: handleCancel,
          actionText: translateText('subscription.confirm_cancel', 'Confirm Cancellation'),
          actionIcon: <AlertTriangle className="h-4 w-4 mr-2" />,
          actionClass: 'bg-red-500 hover:bg-red-600 text-white',
        };

      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border border-white/20">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          <DialogTitle className="text-xl font-semibold">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm">
                {type === 'upgrade' ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                )}
                <span className={type === 'upgrade' ? 'text-foreground' : 'text-muted-foreground'}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto backdrop-blur-md bg-white/10 dark:bg-gray-800/20 border-white/20 hover:bg-white/20"
          >
            {translateText('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={content.action}
            disabled={loading}
            className={`w-full sm:w-auto ${content.actionClass}`}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            )}
            {!loading && content.actionIcon}
            {content.actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};