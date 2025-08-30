import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { AuthService, AuthErrorHandler } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/common/Logo';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/utils/analytics';
import { supabase } from '@/integrations/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import { useRegistrationStore } from '@/stores/registrationStore';

export default function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { resetRegistration } = useRegistrationStore();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    fullName: ''
  });

  // Redirect if already authenticated and registration is completed
  useEffect(() => {
    if (!authLoading && user) {
      // For already authenticated users, redirect to register to continue/complete registration
      // The Register.tsx component will handle checking completion status and redirect to dashboard if needed
      navigate('/register');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!AuthService.validateEmail(formData.email)) {
      setError(t('auth.errors.invalidEmail'));
      return false;
    }
    if (!formData.password) {
      setError(t('auth.errors.passwordTooShort'));
      return false;
    }
    const passwordValidation = AuthService.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(t(passwordValidation.errors[0]));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.fullName) {
      setError('Full name is required');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Starting sign-up process...');
      const { user, session, error } = await AuthService.signUpWithEmail({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone
      });

      if (error) {
        console.error('Sign-up error:', error);
        const errorKey = AuthErrorHandler.getErrorMessageKey(error);
        setError(t(errorKey));
        analytics.trackAuthError(error.message, 'email', formData.email);
        
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Please try signing in instead.');
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          setError('Network error. Please check your connection and try again.');
        }
      } else if (user && session) {
        console.log('Sign-up successful, user authenticated:', user.email);
        
        // Reset registration store for new user to clear any previous user's data
        console.log('Resetting registration store for new user...');
        resetRegistration();
        
        toast({
          title: 'Account Created Successfully!',
          description: 'Welcome to Secure Retire! Redirecting to complete your profile...',
        });
        
        // Track successful signup
        analytics.trackSignup({ email: formData.email, method: 'email' });
        
        // Direct redirect to registration form - no delays or session checking
        console.log('Redirecting to registration form...');
        // Use replace to prevent back navigation to signup after successful registration
        navigate('/register', { replace: true });
      } else {
        console.error('Sign-up completed but no user/session returned');
        setError('Sign-up completed but authentication failed. Please try signing in.');
      }
    } catch (err) {
      console.error('Sign-up exception:', err);
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      analytics.trackAuthError(errorMessage, 'email', formData.email);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = 'https://app.asankaherath.com'}
          className="glass-btn-secondary glass-text-primary flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('nav.home', 'Home')}
        </Button>
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50" data-testid="theme-toggle">
        <ThemeToggle />
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background" data-testid="auth-form-container">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo className="w-36 h-36" />
            </div>
            <h1 className="text-2xl font-bold glass-text-primary">
              Create Account
            </h1>
            <p className="text-sm glass-text-secondary mt-2">
              Sign up to manage your retirement planning
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="glass-base border-red-400/30 bg-red-50/30 dark:bg-red-900/20">
              <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="glass-text-primary font-medium">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="glass-input glass-text-primary h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="glass-text-primary font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="glass-input glass-text-primary h-12"
                aria-describedby="email-error"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="glass-text-primary font-medium">
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 000 0000 0000"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="glass-input glass-text-primary h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="glass-text-primary font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="glass-input glass-text-primary h-12 pr-10"
                  aria-describedby="password-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 glass-text-muted" /> : <Eye className="h-4 w-4 glass-text-muted" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="glass-text-primary font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="glass-input glass-text-primary h-12 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeOff className="h-4 w-4 glass-text-muted" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleSignUp} 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
              disabled={loading}
              aria-label="Create account"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Register
            </Button>

            <div className="text-center text-sm glass-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 items-end justify-end p-8 relative overflow-hidden" data-testid="auth-marketing-container">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/lovable-uploads/7ceb37c0-b3e6-4870-aaa2-3c3cf9b97bbe.png" 
            alt="Elderly professionals planning retirement"
            className="w-full h-full object-cover "
          />
          <div className="absolute inset-0 "></div>
        </div>

        <div className="relative z-10  text-center lg:text-left space-y-8 p-10">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Building a Strong Foundation for Your Retirement
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Simplify your financial, legal, and estate planning journey with
              expert guidance. We help you secure your future with confidence.
            </p>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap gap-4 justify-start ">
            <div className="flex items-center gap-2 glass-base px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-white text-sm font-medium">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2 glass-base px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-white text-sm font-medium">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2 glass-base px-4 py-2 rounded-full">
              <Lock className="h-5 w-5 text-success" />
              <span className="text-white text-sm font-medium">Data Protection</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 pt-8 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                <span className="text-white text-sm">?</span>
              </div>
              <span className="text-white/80 text-sm">Need help?</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <div className="text-white font-semibold">1-800-SECURE (1-800-732-873)</div>
                <div className="text-white/60 text-xs">Available Monday to Friday, 8 AM - 8 PM EST</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}