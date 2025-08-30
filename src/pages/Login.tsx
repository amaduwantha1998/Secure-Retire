import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AuthService, AuthErrorHandler } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/common/Logo';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/utils/analytics';
import ThemeToggle from '@/components/ThemeToggle';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';

export default function Login() {
  const { t } = useTranslation();
  const { dt, isLoading: isTranslating } = useDynamicTranslation();
  const { isTranslating: isRealTimeTranslating } = useRealTimeTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard/overview');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!AuthService.validateEmail(formData.email)) {
      setError(dt(t('auth.errors.invalidEmail', 'Please enter a valid email address')));
      return false;
    }
    if (!formData.password) {
      setError(dt(t('auth.errors.passwordTooShort', 'Password must be at least 6 characters')));
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await AuthService.signInWithEmail({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        const errorKey = AuthErrorHandler.getErrorMessageKey(error);
        setError(dt(t(errorKey, 'Invalid credentials')));
        
        // Track authentication error
        analytics.trackAuthError(error.message, 'email', formData.email);
        
        if (AuthErrorHandler.requiresEmailConfirmation(error)) {
          toast({
            title: dt(t('auth.checkEmail', 'Check your email')),
            description: dt('Please check your email for the confirmation link.'),
          });
        }
      } else {
        toast({
          title: dt(t('auth.welcome', 'Welcome')),
          description: dt('Successfully signed in! Redirecting to dashboard...'),
        });
        // Track successful login
        analytics.trackLogin({ email: formData.email, method: 'email' });
        console.log('User login successful:', formData.email);
        navigate('/dashboard/overview');
      }
    } catch (err) {
      const errorMessage = dt(t('auth.errors.networkError', 'Network error. Please check your connection.'));
      setError(errorMessage);
      analytics.trackAuthError(errorMessage, 'email', formData.email);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError(dt(t('auth.errors.invalidEmail', 'Please enter a valid email address')));
      return;
    }

    setLoading(true);
    try {
      const { error } = await AuthService.resetPassword({ email: formData.email });

      if (error) {
        const errorKey = AuthErrorHandler.getErrorMessageKey(error);
        setError(dt(t(errorKey, 'An error occurred')));
      } else {
        toast({
          title: dt(t('auth.passwordReset', 'Password reset email sent!')),
          description: dt('Check your email for the reset link.'),
        });
      }
    } catch (err) {
      setError(dt(t('auth.errors.networkError', 'Network error. Please check your connection.')));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>{dt(t('common.loading', 'Loading...'))}</span>
        </div>
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
          {dt(t('nav.home', 'Home'))}
        </Button>
      </div>

      {/* Language and Theme Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background" data-testid="auth-form-container">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo size="brand" />
            </div>
            <h1 className="text-2xl font-bold glass-text-primary">
              {dt(t('auth.welcome', 'Welcome Back'))}
            </h1>
            <p className="text-sm glass-text-secondary mt-2">
              {dt(t('auth.signInToAccount', 'Sign in to manage your retirement planning'))}
            </p>
          </div>

          {/* Translation Loading Indicator */}
          {(isTranslating || isRealTimeTranslating) && (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>{dt('Translating...')}</span>
            </div>
          )}

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
              <Label htmlFor="email" className="glass-text-primary font-medium">
                {dt(t('common.email', 'Email or Username'))}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={dt(t('common.email', 'Enter your email or username'))}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="glass-input glass-text-primary h-12"
                aria-describedby="email-error"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="glass-text-primary font-medium">
                {dt(t('common.password', 'Password'))}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={dt(t('common.password', 'Enter your password'))}
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
                  aria-label={showPassword ? dt('Hide password') : dt('Show password')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 glass-text-muted" /> : <Eye className="h-4 w-4 glass-text-muted" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="remember" className="text-sm glass-text-primary">
                  {dt('Keep me signed in')}
                </Label>
              </div>
              <Button onClick={handleForgotPassword} variant="link" className="px-0 text-sm text-primary hover:underline">
                {dt(t('common.forgotPassword', 'Forgot Password?'))}
              </Button>
            </div>

            <Button 
              onClick={handleSignIn} 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
              disabled={loading || isTranslating || isRealTimeTranslating}
              aria-label={dt(t('common.signIn', 'Sign in to your account'))}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dt(t('common.loading', 'Loading...'))}
                </>
              ) : (
                dt(t('common.signIn', 'Sign In'))
              )}
            </Button>

            <div className="text-center text-sm glass-text-muted">
              {dt('New to SecureRetire?')}{' '}
              <Link to="/signup" className="text-primary hover:underline">
                {dt(t('common.signUp', 'Create Account'))}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 items-end justify-Start bg-gradient-to-br  p-8 relative overflow-hidden" data-testid="auth-marketing-container">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/lovable-uploads/7ceb37c0-b3e6-4870-aaa2-3c3cf9b97bbe.png" 
            alt={dt('Elderly professionals planning retirement')}
            className="w-full h-full object-cover opacity-100 dark:opacity-100"
          />
          <div className="absolute inset-0 "></div>
        </div>

        <div className="relative z-10  text-center lg:text-left space-y-8 p-10">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              {dt('Building a Strong Foundation for Your Retirement')}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              {dt('Simplify your financial, legal, and estate planning journey with expert guidance. We help you secure your future with confidence.')}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 pt-8 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                <span className="text-white text-sm">?</span>
              </div>
              <span className="text-white/80 text-sm">{dt('Need help?')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <div className="text-white font-semibold">Hotline: +94710898944</div>
                <div className="text-white/60 text-xs">{dt('Available Monday to Friday, 8 AM - 8 PM EST')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}