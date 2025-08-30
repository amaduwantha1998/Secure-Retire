import { supabase } from '@/integrations/supabase/client';
import { AuthError, User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  user?: User | null;
  session?: Session | null;
  error?: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  phone?: string;
  fullName?: string;
}

export interface SignInData {
  email?: string;
  password?: string;
  phone?: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface PhoneAuthData {
  phone: string;
  token?: string;
}

// Auth Service Class
export class AuthService {
  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(data: SignUpData): Promise<AuthResponse> {
    try {
      console.log('Sign up attempt:', { email: data.email });
      
      // Disable email verification for faster registration flow
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: null, // Disable email verification for immediate flow
          data: {
            full_name: data.fullName || '',
            phone: data.phone || '',
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Sign up response:', { 
        user: !!authData.user, 
        session: !!authData.session,
        email: authData.user?.email 
      });

      // For immediate registration flow, ensure we have both user and session
      if (authData.user && authData.session) {
        console.log('User registration successful with active session:', authData.user.email);
        
        return {
          user: authData.user,
          session: authData.session,
          error: null
        };
      } else if (authData.user && !authData.session) {
        console.log('User created but no session - attempting to establish session');
        
        // Try to establish session immediately
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });

          if (signInError) {
            console.error('Failed to establish session after signup:', signInError);
            return { error: signInError };
          }

          console.log('Session established after signup');
          return {
            user: signInData.user,
            session: signInData.session,
            error: null
          };
        } catch (sessionError) {
          console.error('Exception establishing session:', sessionError);
          return { error: sessionError as AuthError };
        }
      } else {
        console.error('Sign up completed but no user returned');
        return { 
          error: { 
            message: 'Sign up completed but user creation failed', 
            name: 'SignUpError' 
          } as AuthError 
        };
      }
    } catch (error) {
      console.error('Sign up exception:', error);
      return {
        error: error as AuthError
      };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email!,
        password: data.password!,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('User signed in successfully:', authData.user?.email);
      return {
        user: authData.user,
        session: authData.session,
        error: null
      };
    } catch (error) {
      console.error('Sign in exception:', error);
      return {
        error: error as AuthError
      };
    }
  }


  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error?: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(data: ResetPasswordData): Promise<{ error?: AuthError | null }> {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Update password (after reset)
   */
  static async updatePassword(newPassword: string): Promise<{ error?: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<{ session: Session | null; error?: AuthError | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      return { session: null, error: error as AuthError };
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<{ user: User | null; error?: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Refresh session
   */
  static async refreshSession(): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.refreshSession();
      return {
        user: authData.user,
        session: authData.session,
        error
      };
    } catch (error) {
      return {
        error: error as AuthError
      };
    }
  }

  /**
   * Set up MFA (Multi-Factor Authentication)
   */
  static async enrollMFA(phone: string): Promise<{ error?: AuthError | null }> {
    try {
      const { error } = await supabase.auth.mfa.enroll({
        factorType: 'phone',
        phone
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Verify MFA challenge
   */
  static async verifyMFA(factorId: string, challengeId: string, code: string): Promise<{ error?: AuthError | null }> {
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code
      });

      return { error };
    } catch (error) {
      return {
        error: error as AuthError
      };
    }
  }


  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('auth.passwordRequirements.minLength');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('auth.passwordRequirements.lowercase');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('auth.passwordRequirements.uppercase');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('auth.passwordRequirements.number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('auth.passwordRequirements.special');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Auth Error Handler
export class AuthErrorHandler {
  /**
   * Get user-friendly error message key for i18n
   */
  static getErrorMessageKey(error: AuthError | null): string {
    if (!error) return '';

    console.log('Auth error details:', error);

    // Check error message patterns
    const message = error.message.toLowerCase();
    
    if (message.includes('user already registered') || message.includes('already been registered')) {
      return 'auth.errors.userExists';
    }
    if (message.includes('invalid login credentials')) {
      return 'auth.errors.invalidCredentials';
    }
    if (message.includes('email not confirmed')) {
      return 'auth.errors.emailNotConfirmed';
    }
    if (message.includes('password') && (message.includes('6 characters') || message.includes('too short'))) {
      return 'auth.errors.passwordTooShort';
    }
    if (message.includes('email') && message.includes('invalid')) {
      return 'auth.errors.invalidEmail';
    }
    if (message.includes('phone') && message.includes('invalid')) {
      return 'auth.errors.invalidPhone';
    }
    if (message.includes('token') && (message.includes('expired') || message.includes('invalid'))) {
      return 'auth.errors.invalidToken';
    }
    if (message.includes('sms') || message.includes('could not be sent')) {
      return 'auth.errors.smsError';
    }
    if (message.includes('too many requests') || message.includes('rate limit')) {
      return 'auth.errors.tooManyRequests';
    }
    if (message.includes('signup') && message.includes('disabled')) {
      return 'auth.errors.signupDisabled';
    }

    return 'auth.errors.generic';
  }

  /**
   * Check if error is rate limit related
   */
  static isRateLimitError(error: AuthError | null): boolean {
    return error?.message?.includes('Too many requests') || 
           error?.message?.includes('rate limit') || false;
  }

  /**
   * Check if error requires email confirmation
   */
  static requiresEmailConfirmation(error: AuthError | null): boolean {
    return error?.message?.includes('Email not confirmed') || false;
  }
}