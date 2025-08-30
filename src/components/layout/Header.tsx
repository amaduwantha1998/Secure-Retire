import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';
import { useAuth } from '@/contexts/AuthContext';
export const Header: React.FC = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const handleSignIn = () => {
    navigate('/login');
  };
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };
  return <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 w-[250px]">
            <Logo size="md" />
            <div>
              
              
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {t('nav.home')}
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {t('nav.planning')}
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {t('nav.investments')}
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {t('nav.goals')}
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {t('nav.reports')}
            </a>
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <CurrencySelector />
            <LanguageSelector />
            {!loading && <>
                {user ? <Button size="sm" onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-primary to-primary-glow">
                    Dashboard
                  </Button> : <>
                    <Button variant="outline" size="sm" onClick={handleSignIn}>
                      Sign In
                    </Button>
                    <Button size="sm" onClick={handleGetStarted} className="bg-gradient-to-r from-primary to-primary-glow">
                      {t('common.getStarted')}
                    </Button>
                  </>}
              </>}
          </div>
        </div>
      </div>
    </header>;
};