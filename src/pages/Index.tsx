import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleLearnMore = () => {
    // Scroll to features section or navigate to about page
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <Logo size="xl" className="drop-shadow-lg" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary-custom bg-clip-text text-transparent">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-primary to-primary-glow text-lg px-8 py-6 shadow-elegant hover:shadow-glow transition-all duration-300"
            >
              {user ? 'Go to Dashboard' : t('hero.cta')}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleLearnMore}
              className="text-lg px-8 py-6"
            >
              {t('common.learnMore')}
            </Button>
          </div>
        </div>
        
        {/* Features Preview */}
        <div id="features" className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-card shadow-sm border">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('nav.planning')}</h3>
            <p className="text-muted-foreground">Comprehensive retirement planning tools</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card shadow-sm border">
            <div className="w-12 h-12 bg-gradient-to-r from-success to-primary-glow rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('nav.investments')}</h3>
            <p className="text-muted-foreground">Smart investment portfolio management</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card shadow-sm border">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary-custom to-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('nav.goals')}</h3>
            <p className="text-muted-foreground">Track and achieve your retirement goals</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
