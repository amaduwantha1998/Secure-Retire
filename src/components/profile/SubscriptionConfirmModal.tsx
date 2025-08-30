import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle, Loader2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';

interface SubscriptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const SubscriptionConfirmModal: React.FC<SubscriptionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const { formatAmount } = useCurrency();
  const { t: translateText } = useRealTimeTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border border-white/20 rounded-xl">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-yellow-500" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {translateText('subscription.confirm_upgrade', 'Confirm Pro Upgrade')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {translateText(
              'subscription.confirm_upgrade_description',
              'You are about to upgrade to Pro for $1.00. This will unlock all premium features.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3 p-4 backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-xl">
            <h4 className="font-medium text-sm">
              {translateText('subscription.transaction_details', 'Transaction Details')}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {translateText('subscription.plan', 'Plan')}:
                </span>
                <span className="font-medium">Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {translateText('subscription.amount', 'Amount')}:
                </span>
                <span className="font-medium">$1.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {translateText('subscription.billing', 'Billing')}:
                </span>
                <span className="font-medium">
                  {translateText('subscription.monthly', 'Monthly')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span>{translateText('subscription.unlimited_ai', 'Unlimited AI features')}</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span>{translateText('subscription.priority_support', 'Priority support')}</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span>{translateText('subscription.advanced_analytics', 'Advanced analytics')}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto backdrop-blur-md bg-white/10 dark:bg-gray-800/20 border-white/20 hover:bg-white/20 rounded-xl"
          >
            {translateText('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl"
            aria-label="Proceed to payment"
            tabIndex={0}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" data-testid="loading-spinner" />}
            {!loading && <Crown className="h-4 w-4 mr-2" />}
            {translateText('subscription.proceed_to_pay', 'Proceed to Pay')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};