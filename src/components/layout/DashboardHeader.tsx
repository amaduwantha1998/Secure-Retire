import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Settings,
  User,
  Bell,
  ChevronDown,
  Crown,
  Zap,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';

export function DashboardHeader() {
  const { t } = useTranslation();
  const { dt } = useDynamicTranslation();
  const { t: translateText } = useRealTimeTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    accountType,
    isProUser,
    remainingCredits,
    isCreditsLow,
    isCreditsEmpty,
    isLoading,
  } = useSubscriptionData();

  const handleSignOut = async () => {
    try {
      console.log('Signing out user...');
      await signOut();
      console.log('Sign out successful, redirecting to login...');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect to login even if sign out fails
      navigate('/login');
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getAccountDisplayText = () => {
    if (isLoading) return translateText('account.loading', 'Loading...');
    
    if (isProUser) {
      return translateText('account.pro_unlimited', 'Pro Account - Unlimited');
    } else {
      const creditsText = remainingCredits === 1 
        ? translateText('account.credit_remaining', 'Credit Remaining')
        : translateText('account.credits_remaining', 'Credits Remaining');
      return `${translateText('account.free_account', 'Free Account')} - ${remainingCredits} ${creditsText}`;
    }
  };

  const handleUpgradeClick = () => {
    navigate('/dashboard/profile?tab=pricing');
  };

  return (
    <header className="sticky top-0 glass-nav bg-sidebar border-b border-border glass-text-primary flex h-16 items-center justify-between px-4 lg:px-6">
    
      {/* Account Type & Credits Display */}
      <div className="hidden lg:flex items-center">
        <div className=" ">
          <div className="flex items-center gap-3">
            {/* Account Type Icon */}
            <div className="flex items-center gap-2">
              {isProUser ? (
                <Crown className="h-4 w-4 text-amber-500" />
              ) : (
                <Zap className="h-4 w-4 text-blue-500" />
              )}
              
              {/* Account Status Text */}
              <div className="flex flex-col">
                <span className="text-sm font-medium glass-text-primary">
                  {getAccountDisplayText()}
                </span>
                {isCreditsLow && !isProUser && (
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{translateText('account.credits_low', 'Credits running low')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade Button for Free Users */}
            {!isProUser && (
              <>
                <div className="h-6 w-px bg-border/50" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUpgradeClick}
                  className="text-xs px-3 py-1 h-auto bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {translateText('account.upgrade', 'Upgrade')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="hidden md:block">
          <LanguageSelector />
        </div>

        {/* Currency Selector */}
        <div className="hidden md:block">
          <CurrencySelector />
        </div>

        {/* Theme Toggle */}
        <div>
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-auto px-2 hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={getUserDisplayName()}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(getUserDisplayName())}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {getUserDisplayName()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {/* Account info for mobile */}
                <div className="lg:hidden pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    {isProUser ? (
                      <Crown className="h-3 w-3 text-amber-500" />
                    ) : (
                      <Zap className="h-3 w-3 text-blue-500" />
                    )}
                    <span className="text-muted-foreground">
                      {getAccountDisplayText()}
                    </span>
                  </div>
                  {isCreditsLow && !isProUser && (
                    <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{translateText('account.credits_low', 'Credits running low')}</span>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Mobile-only controls */}
            <div className="md:hidden">
              <DropdownMenuItem onClick={() => {}}>
                <span className="mr-2">🌐</span>
                {dt('Language')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <span className="mr-2">💱</span>
                {dt('Currency')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>

            <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>{dt('Profile Settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{dt('Settings')}</span>
            </DropdownMenuItem>
            
            {/* Mobile Upgrade Button */}
            {!isProUser && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleUpgradeClick}
                  className="text-amber-600 dark:text-amber-400 focus:text-amber-600 dark:focus:text-amber-400"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>{translateText('account.upgrade_to_pro', 'Upgrade to Pro')}</span>
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{dt('Sign Out')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}