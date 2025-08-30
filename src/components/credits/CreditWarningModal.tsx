import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Crown, Zap, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';

interface CreditWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'low_credits' | 'no_credits' | 'feature_blocked';
  featureName?: string;
}

export function CreditWarningModal({ 
  isOpen, 
  onClose, 
  trigger = 'low_credits',
  featureName 
}: CreditWarningModalProps) {
  const navigate = useNavigate();
  const { t: translateText } = useRealTimeTranslation();
  const {
    isProUser,
    remainingCredits,
    availableCredits,
    isCreditsEmpty,
  } = useSubscriptionData();

  const handleUpgrade = () => {
    navigate('/dashboard/profile?tab=pricing');
    onClose();
  };

  const getModalContent = () => {
    switch (trigger) {
      case 'no_credits':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          title: translateText('credits.modal.no_credits_title', 'No Credits Remaining'),
          description: translateText('credits.modal.no_credits_desc', 'You\'ve used all your monthly credits. Upgrade to Pro for unlimited access to all premium features.'),
          color: 'red',
        };
      
      case 'feature_blocked':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          title: translateText('credits.modal.feature_blocked_title', 'Feature Requires Credits'),
          description: translateText('credits.modal.feature_blocked_desc', `${featureName || 'This feature'} requires credits to use. Upgrade to Pro for unlimited access to all features.`),
          color: 'amber',
        };
      
      default: // low_credits
        return {
          icon: <Zap className="h-8 w-8 text-blue-500" />,
          title: translateText('credits.modal.low_credits_title', 'Credits Running Low'),
          description: translateText('credits.modal.low_credits_desc', 'You\'re running low on credits. Consider upgrading to Pro for unlimited access and advanced features.'),
          color: 'blue',
        };
    }
  };

  const content = getModalContent();
  const usagePercentage = availableCredits > 0 ? ((availableCredits - remainingCredits) / availableCredits) * 100 : 100;

  if (isProUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {content.icon}
              {content.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="pt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credit Usage Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {translateText('credits.modal.usage', 'Monthly Credit Usage')}
              </span>
              <span className="font-medium">
                {availableCredits - remainingCredits} / {availableCredits}
              </span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={`h-2 ${
                usagePercentage >= 90 ? 'bg-red-100' : 
                usagePercentage >= 70 ? 'bg-amber-100' : 'bg-blue-100'
              }`}
            />
            <p className="text-xs text-muted-foreground">
              {remainingCredits} {translateText('credits.modal.credits_left', 'credits remaining this month')}
            </p>
          </div>

          {/* Pro Benefits */}
          <div className="backdrop-blur-md bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-800/30">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-amber-700 dark:text-amber-300">
                {translateText('credits.modal.pro_benefits', 'Pro Plan Benefits')}
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-400">
              <li>• {translateText('credits.modal.unlimited_credits', 'Unlimited credits')}</li>
              <li>• {translateText('credits.modal.advanced_ai', 'Advanced AI features')}</li>
              <li>• {translateText('credits.modal.priority_support', 'Priority customer support')}</li>
              <li>• {translateText('credits.modal.premium_tools', 'Access to premium planning tools')}</li>
            </ul>
          </div>

          {/* Current Plan Info */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {translateText('credits.modal.current_plan', 'Current Plan: Free')}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{remainingCredits}</p>
              <p className="text-xs text-muted-foreground">
                {translateText('credits.modal.credits_left_short', 'credits left')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            {translateText('credits.modal.upgrade_now', 'Upgrade to Pro - $20/month')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            {translateText('credits.modal.continue_free', 'Continue with Free Plan')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}