import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';
import { CreditWarningModal } from './CreditWarningModal';

interface CreditProtectedRouteProps {
  children: React.ReactNode;
  requiredCredits?: number;
  featureName?: string;
  fallbackComponent?: React.ReactNode;
}

export function CreditProtectedRoute({ 
  children, 
  requiredCredits = 0,
  featureName = 'This feature',
  fallbackComponent 
}: CreditProtectedRouteProps) {
  const navigate = useNavigate();
  const { t: translateText } = useRealTimeTranslation();
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const {
    isProUser,
    remainingCredits,
    isCreditsEmpty,
    isLoading,
  } = useSubscriptionData();

  useEffect(() => {
    // Show warning modal if feature is blocked
    if (!isLoading && !isProUser && requiredCredits > 0 && remainingCredits < requiredCredits) {
      setShowWarningModal(true);
    }
  }, [isLoading, isProUser, requiredCredits, remainingCredits]);

  const handleUpgrade = () => {
    navigate('/dashboard/profile?tab=pricing');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Pro users always have access
  if (isProUser) {
    return <>{children}</>;
  }

  // Free users with sufficient credits
  if (requiredCredits === 0 || remainingCredits >= requiredCredits) {
    return (
      <>
        {children}
        <CreditWarningModal
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          trigger={isCreditsEmpty ? 'no_credits' : 'feature_blocked'}
          featureName={featureName}
        />
      </>
    );
  }

  // Fallback component for blocked access
  if (fallbackComponent) {
    return (
      <>
        {fallbackComponent}
        <CreditWarningModal
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          trigger={isCreditsEmpty ? 'no_credits' : 'feature_blocked'}
          featureName={featureName}
        />
      </>
    );
  }

  // Default blocked access UI
  return (
    <div className="space-y-6">
      <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-300">
              {translateText('credits.feature_locked', 'Feature Locked')}
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              {translateText('credits.upgrade_required', `${featureName} requires ${requiredCredits} credit${requiredCredits > 1 ? 's' : ''}. You have ${remainingCredits} remaining.`)}
            </p>
          </div>
          <Button
            onClick={handleUpgrade}
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white ml-4"
          >
            <Crown className="h-4 w-4 mr-1" />
            {translateText('credits.upgrade', 'Upgrade')}
          </Button>
        </AlertDescription>
      </Alert>

      {/* Feature preview (disabled state) */}
      <div className="relative">
        <div className="pointer-events-none opacity-50 select-none">
          {children}
        </div>
        <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 dark:bg-black/10 flex items-center justify-center">
          <div className="text-center p-6 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg backdrop-blur-md border border-white/20 dark:border-gray-700/30">
            <Crown className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-semibold mb-2">
              {translateText('credits.premium_feature', 'Premium Feature')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {translateText('credits.upgrade_to_unlock', 'Upgrade to Pro to unlock this feature')}
            </p>
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {translateText('credits.upgrade_now', 'Upgrade Now')}
            </Button>
          </div>
        </div>
      </div>

      <CreditWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        trigger={isCreditsEmpty ? 'no_credits' : 'feature_blocked'}
        featureName={featureName}
      />
    </div>
  );
}