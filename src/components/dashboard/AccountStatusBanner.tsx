import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Crown, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';

interface AccountStatusBannerProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function AccountStatusBanner({ onDismiss, showDismiss = false }: AccountStatusBannerProps) {
  const navigate = useNavigate();
  const { t: translateText } = useRealTimeTranslation();
  const {
    isProUser,
    remainingCredits,
    isCreditsLow,
    isCreditsEmpty,
    isLoading,
  } = useSubscriptionData();

  // Don't show banner for Pro users or when loading
  if (isLoading || isProUser) return null;

  // Don't show banner if credits are not low
  if (!isCreditsLow && !isCreditsEmpty) return null;

  const handleUpgrade = () => {
    navigate('/dashboard/profile?tab=pricing');
    onDismiss?.();
  };

  return (
    <Alert className={`relative backdrop-blur-md shadow-lg border-l-4 ${
      isCreditsEmpty 
        ? 'bg-red-50/50 dark:bg-red-900/20 border-l-red-500 border-red-200 dark:border-red-800' 
        : 'bg-amber-50/50 dark:bg-amber-900/20 border-l-amber-500 border-amber-200 dark:border-amber-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          {isCreditsEmpty ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <Zap className="h-4 w-4 text-amber-500" />
          )}
          
          <AlertDescription className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                {isCreditsEmpty ? (
                  <span className="font-medium text-red-700 dark:text-red-300">
                    {translateText('account.no_credits', 'No Credits Remaining')}
                  </span>
                ) : (
                  <span className="font-medium text-amber-700 dark:text-amber-300">
                    {translateText('account.low_credits_warning', `Only ${remainingCredits} credits left`)}
                  </span>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {translateText('account.upgrade_message', 'Upgrade to Pro for unlimited access to all features')}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={handleUpgrade}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  {translateText('account.upgrade_now', 'Upgrade Now')}
                </Button>
                
                {showDismiss && onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDismiss}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}