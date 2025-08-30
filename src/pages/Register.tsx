import React, { useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Logo } from '@/components/common/Logo';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Lazy load components for better performance
const PersonalInfo = lazy(() => import('@/components/register/PersonalInfo'));
const FinancialDetails = lazy(() => import('@/components/register/FinancialDetails'));
const Beneficiaries = lazy(() => import('@/components/register/Beneficiaries'));
const PricingStep = lazy(() => import('@/components/register/PricingStep'));
const Summary = lazy(() => import('@/components/register/Summary'));
import ThemeToggle from '@/components/ThemeToggle';
const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data, setCurrentStep, nextStep, prevStep } = useRegistrationStore();

  // Redirect to login if not authenticated, or to dashboard if already completed
  useEffect(() => {
    console.log('Auth state check:', { authLoading, user: !!user, isCompleted: data.isCompleted, currentStep: data.currentStep });
    
    if (!authLoading && !user) {
      console.log('No user found, redirecting to login...');
      navigate('/login', { replace: true });
    } else if (!authLoading && user && data.isCompleted) {
      console.log('Registration completed, redirecting to dashboard...');
      navigate('/dashboard/overview', { replace: true });
    } else if (!authLoading && user) {
      console.log('User authenticated, continuing registration flow...');
      // Ensure we're on step 1 for new registrations if currentStep is 0 or undefined
      if (data.currentStep === 0 || !data.currentStep) {
        console.log('Setting current step to 1 for new user...');
        setCurrentStep(1);
      }
    }
  }, [user, authLoading, navigate, data.isCompleted, data.currentStep, setCurrentStep]);

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Basic details and address' },
    { id: 2, title: 'Financial Details', description: 'Income, assets, and debts' },
    { id: 3, title: 'Beneficiaries', description: 'Your designated beneficiaries' },
    { id: 4, title: 'Pricing', description: 'Choose your plan' },
    { id: 5, title: 'Summary', description: 'Review and submit' },
  ];

  const currentStepData = steps.find(step => step.id === data.currentStep);
  const progressPercentage = ((data.currentStep - 1) / (steps.length - 1)) * 100;

  const renderStepContent = () => {
    const StepFallback = ({ error }: { error?: Error }) => (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load step content. Please refresh the page or try again.
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="text-xs mt-1">{error.message}</pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
    );

    switch (data.currentStep) {
      case 1:
        return (
          <ErrorBoundary fallback={<StepFallback />}>
            <Suspense fallback={<LoadingFallback />}>
              <PersonalInfo />
            </Suspense>
          </ErrorBoundary>
        );
      case 2:
        return (
          <ErrorBoundary fallback={<StepFallback />}>
            <Suspense fallback={<LoadingFallback />}>
              <FinancialDetails />
            </Suspense>
          </ErrorBoundary>
        );
      case 3:
        return (
          <ErrorBoundary fallback={<StepFallback />}>
            <Suspense fallback={<LoadingFallback />}>
              <Beneficiaries />
            </Suspense>
          </ErrorBoundary>
        );
      case 4:
        return (
          <ErrorBoundary fallback={<StepFallback />}>
            <Suspense fallback={<LoadingFallback />}>
              <PricingStep />
            </Suspense>
          </ErrorBoundary>
        );
      case 5:
        return (
          <ErrorBoundary fallback={<StepFallback />}>
            <Suspense fallback={<LoadingFallback />}>
              <Summary />
            </Suspense>
          </ErrorBoundary>
        );
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid step. Please start over or contact support.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const canProceed = () => {
    switch (data.currentStep) {
      case 1:
        return data.personalInfo.fullName && 
               data.personalInfo.dateOfBirth && 
               data.personalInfo.address.street &&
               data.personalInfo.address.city &&
               data.personalInfo.address.state &&
               data.personalInfo.address.zipCode &&
               data.personalInfo.phone;
      case 2:
        return true; // Financial details are optional
      case 3:
        // Check if beneficiaries total 100% if any are added
        const totalPercentage = data.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
        return data.beneficiaries.length === 0 || totalPercentage === 100;
      case 4:
        return data.pricingInfo.selectedPlan; // Must select a plan
      case 5:
        return true; // Summary step, ready to submit
      default:
        return false;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo className="h-12 w-12 mx-auto" />
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-gray-900/30 dark:via-blue-900/20 dark:to-indigo-900/30 relative overflow-hidden">
      {/* Background Glass Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/5 to-indigo-400/10 dark:from-blue-600/5 dark:via-purple-600/3 dark:to-indigo-600/5"></div>
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Header with Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="glass-logo">
              <Logo className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48" />
            </div>
          </div>
          <h1 className="text-3xl font-bold glass-text-primary mb-2">
            Complete Your Profile
          </h1>
          <p className="glass-text-secondary">
            Help us personalize your retirement planning experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="glass-base p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      data.currentStep >= step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    } ${data.currentStep > step.id ? 'bg-success' : ''}`}
                  >
                    {data.currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-muted mx-4 mt-5" />
                )}
              </div>
            ))}
            </div>
            <Progress value={progressPercentage} className="h-2 glass-optimized" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass-enhanced glass-optimized">
            <CardHeader>
              <CardTitle className="text-xl glass-text-primary" data-testid="current-step">
                Step {data.currentStep}: {currentStepData?.title}
              </CardTitle>
              <p className="glass-text-secondary">
                {currentStepData?.description}
              </p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={data.currentStep === 1}
              className="flex items-center gap-2 glass-btn-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {data.currentStep < 5 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 glass-btn-primary"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="text-sm glass-text-muted">
                Review your information and click "Complete Registration" in the summary above.
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8 text-sm glass-text-muted">
          <p>Need help? Contact our support team at support@secureretire.com</p>
        </div>
      </div>
    </div>
  );
}