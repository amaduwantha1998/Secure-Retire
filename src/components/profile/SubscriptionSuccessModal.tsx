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
import { CheckCircle, Crown } from 'lucide-react';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';

interface SubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionSuccessModal: React.FC<SubscriptionSuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t: translateText } = useRealTimeTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-md bg-green-600/50 text-white border border-green-500/20 rounded-xl">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-300" />
              <Crown className="h-8 w-8 text-yellow-300 absolute -top-2 -right-2" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            {translateText('subscription.upgrade_successful', 'Upgrade Successful!')}
          </DialogTitle>
          <DialogDescription className="text-green-100">
            {translateText(
              'subscription.upgrade_successful_description',
              'Your Pro account is now active. You now have unlimited access to all premium features.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3 p-4 backdrop-blur-md bg-white/10 rounded-xl">
            <h4 className="font-medium text-sm text-white">
              {translateText('subscription.pro_benefits', 'Pro Benefits Unlocked')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-300 mr-2 flex-shrink-0" />
                <span>{translateText('subscription.unlimited_ai', 'Unlimited AI features')}</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-300 mr-2 flex-shrink-0" />
                <span>{translateText('subscription.priority_support', 'Priority support')}</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-300 mr-2 flex-shrink-0" />
                <span>{translateText('subscription.advanced_analytics', 'Advanced analytics')}</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-300 mr-2 flex-shrink-0" />
                <span>{translateText('subscription.document_generation', 'Document generation')}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-xl"
            aria-label="Continue to dashboard"
            tabIndex={0}
          >
            <Crown className="h-4 w-4 mr-2" />
            {translateText('subscription.continue_to_dashboard', 'Continue to Dashboard')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};