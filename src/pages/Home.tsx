import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, DollarSign, FileText, Calculator, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/Logo';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { dt, isLoading: isTranslating } = useDynamicTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignUp = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="glass-enhanced rounded-3xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-8">
              <div className="glass-logo">
                <Logo size="xl" className="w-32 md:w-48 drop-shadow-2xl" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary-custom bg-clip-text text-transparent">
              {dt(t('hero.secureRetirementTitle', 'Secure Your Retirement Future Today'))}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              {dt(t('hero.aiPoweredSubtitle', 'Plan and protect your finances with AI-powered tools - As of August 16, 2025'))}
            </p>
            
            {/* Translation Loading Indicator */}
            {isTranslating && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
                <div className="w-3 h-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>{dt('Translating...')}</span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleSignUp}
                className="group bg-gradient-to-r from-primary to-primary-glow text-white text-lg px-8 py-4 shadow-elegant hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1"
                aria-label={dt(t('common.signUpFree', 'Sign Up for Free'))}
              >
                {user ? dt(t('common.goToDashboard', 'Go to Dashboard')) : dt(t('common.signUpFree', 'Sign Up for Free'))}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLearnMore}
                className="glass-btn-secondary text-lg px-8 py-4"
                aria-label={dt(t('common.learnMore', 'Learn More'))}
              >
                {dt(t('common.learnMore', 'Learn More'))}
              </Button>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {dt(t('features.title', 'Everything You Need to Retire Securely'))}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {dt(t('features.subtitle', 'Comprehensive retirement planning tools powered by AI'))}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Financial Planning Feature */}
            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 glass-text-primary">
                {dt(t('features.financialPlanning.title', 'Financial Planning'))}
              </h3>
              <p className="glass-text-secondary leading-relaxed">
                {dt(t('features.financialPlanning.description', 'Monitor income, assets, and debts with AI insights'))}
              </p>
            </div>

            {/* Legal Support Feature */}
            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-success to-primary-glow rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 glass-text-primary">
                {dt(t('features.legalSupport.title', 'Legal Support'))}
              </h3>
              <p className="glass-text-secondary leading-relaxed">
                {dt(t('features.legalSupport.description', 'Easily create wills and trusts with e-signatures'))}
              </p>
            </div>

            {/* Retirement Calculator Feature */}
            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-custom to-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 glass-text-primary">
                {dt(t('features.retirementCalculator.title', 'Retirement Calculator'))}
              </h3>
              <p className="glass-text-secondary leading-relaxed">
                {dt(t('features.retirementCalculator.description', 'Predict your future with advanced simulations'))}
              </p>
            </div>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="container mx-auto px-4 py-16 mb-16">
          <div className="glass-enhanced rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto">
            <Shield className="w-20 h-20 mx-auto mb-8 text-primary animate-pulse" />
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary-custom bg-clip-text text-transparent">
              {dt(t('cta.title', 'Join Secure Retire Now!'))}
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {dt(t('cta.subtitle', 'Start planning your secure retirement future today with our comprehensive AI-powered tools.'))}
            </p>
            
            <div className="space-y-4">
              <Button 
                size="lg" 
                onClick={handleSignUp}
                className="group bg-gradient-to-r from-primary to-secondary-custom text-white text-xl px-12 py-6 shadow-elegant hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1"
                aria-label={dt(t('cta.signUpButton', 'Sign Up for Free and Start Planning Today!'))}
              >
                {dt(t('cta.signUpButton', 'Sign Up for Free and Start Planning Today!'))}
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {/* Video Placeholder */}
              <div className="mt-12 glass-base rounded-2xl p-8 max-w-2xl mx-auto">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary-custom/20 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                    <p className="glass-text-primary font-medium">
                      {dt(t('cta.videoPlaceholder', 'Watch Our 15-Second Intro Video'))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;