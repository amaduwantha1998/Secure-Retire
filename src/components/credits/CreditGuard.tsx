import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Crown, Zap, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreditSystem, CreditOperation } from '@/hooks/useCreditSystem';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';

interface CreditGuardProps {
  operation: CreditOperation;
  children: React.ReactNode;
  showConfirmation?: boolean;
  onProceed?: () => Promise<void> | void;
  disabled?: boolean;
}

export function CreditGuard({ 
  operation, 
  children, 
  showConfirmation = true,
  onProceed,
  disabled = false
}: CreditGuardProps) {
  const navigate = useNavigate();
  const { t: translateText } = useRealTimeTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    isProUser,
    remainingCredits,
    isCreditsEmpty,
    checkCreditsBeforeOperation,
    deductCredits,
    getCreditStatusMessage,
  } = useCreditSystem();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (disabled) return;

    // Check if user can perform operation
    if (!checkCreditsBeforeOperation(operation)) {
      setShowDialog(true);
      return;
    }

    // If no confirmation needed or pro user, proceed directly
    if (!showConfirmation || isProUser) {
      await handleProceed();
      return;
    }

    // Show confirmation dialog
    setShowDialog(true);
  };

  const handleProceed = async () => {
    setIsProcessing(true);
    try {
      // Deduct credits if not pro user
      if (!isProUser) {
        const success = await deductCredits(operation);
        if (!success) {
          setIsProcessing(false);
          return;
        }
      }

      // Execute the operation
      if (onProceed) {
        await onProceed();
      }
    } catch (error) {
      console.error('Operation failed:', error);
    } finally {
      setIsProcessing(false);
      setShowDialog(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/dashboard/profile?tab=pricing');
    setShowDialog(false);
  };

  const getDialogContent = () => {
    if (isCreditsEmpty) {
      return {
        title: translateText('credits.no_credits_title', 'No Credits Remaining'),
        description: translateText('credits.no_credits_desc', 'You have used all your monthly credits. Upgrade to Pro for unlimited access to all features.'),
        icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
        showUpgrade: true,
        showProceed: false,
      };
    }

    if (remainingCredits < operation.cost) {
      return {
        title: translateText('credits.insufficient_title', 'Insufficient Credits'),
        description: translateText('credits.insufficient_desc', `This feature requires ${operation.cost} credit${operation.cost > 1 ? 's' : ''}, but you only have ${remainingCredits} remaining. Upgrade to Pro for unlimited access.`),
        icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        showUpgrade: true,
        showProceed: false,
      };
    }

    return {
      title: translateText('credits.confirm_title', 'Confirm Action'),
      description: translateText('credits.confirm_desc', `This action will use ${operation.cost} credit${operation.cost > 1 ? 's' : ''} from your account. You will have ${remainingCredits - operation.cost} credits remaining.`),
      icon: <Zap className="h-4 w-4 text-blue-500" />,
      showUpgrade: false,
      showProceed: true,
    };
  };

  const dialogContent = getDialogContent();

  return (
    <>
      <div 
        onClick={handleClick}
        className={`${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        {children}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogContent.icon}
              {dialogContent.title}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Feature Info */}
            <div className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-lg p-3 border border-white/20 dark:border-gray-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{operation.feature}</p>
                  <p className="text-xs text-muted-foreground">{operation.description}</p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {operation.cost} {translateText('credits.credit', 'credit')}{operation.cost > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Current Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {translateText('credits.current_status', 'Current Status:')}
              </span>
              <div className="flex items-center gap-1">
                {isProUser ? (
                  <>
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{translateText('credits.pro_unlimited', 'Pro - Unlimited')}</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{remainingCredits} {translateText('credits.remaining', 'remaining')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            {dialogContent.showUpgrade && (
              <Button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                {translateText('credits.upgrade_to_pro', 'Upgrade to Pro')}
              </Button>
            )}
            
            {dialogContent.showProceed && (
              <Button 
                onClick={handleProceed}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {translateText('credits.processing', 'Processing...')}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {translateText('credits.use_credits', `Use ${operation.cost} Credit${operation.cost > 1 ? 's' : ''}`)}
                  </>
                )}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="w-full"
            >
              {translateText('credits.cancel', 'Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}