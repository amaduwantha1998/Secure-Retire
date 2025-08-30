/**
 * Analytics utility for tracking user interactions
 * In production, this would integrate with Sentry, Google Analytics, or other analytics services
 */

export interface LoginEvent {
  email: string;
  method: 'email' | 'phone' | 'google' | 'apple';
  timestamp: string;
  userAgent: string;
}

export interface SignupEvent {
  email: string;
  method: 'email';
  timestamp: string;
  userAgent: string;
}

class Analytics {
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Track successful login events
   */
  trackLogin(event: Omit<LoginEvent, 'timestamp' | 'userAgent'>) {
    const loginEvent: LoginEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.log('🔐 Login Event:', loginEvent);
    }

    // In production, send to analytics service (Sentry, GA, etc.)
    if (this.isProduction) {
      this.sendToAnalytics('login', loginEvent);
    }
  }

  /**
   * Track successful signup events
   */
  trackSignup(event: Omit<SignupEvent, 'timestamp' | 'userAgent'>) {
    const signupEvent: SignupEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.log('👤 Signup Event:', signupEvent);
    }

    // In production, send to analytics service
    if (this.isProduction) {
      this.sendToAnalytics('signup', signupEvent);
    }
  }

  /**
   * Track authentication errors
   */
  trackAuthError(error: string, method: string, email?: string) {
    const errorEvent = {
      error,
      method,
      email: email || 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.error('🚫 Auth Error:', errorEvent);
    }

    // In production, send to error tracking service (Sentry)
    if (this.isProduction) {
      this.sendToAnalytics('auth_error', errorEvent);
    }
  }

  /**
   * Send events to analytics service
   * Replace this with your actual analytics implementation
   */
  private sendToAnalytics(eventType: string, data: any) {
    // Example implementation for Sentry
    // if (window.Sentry) {
    //   window.Sentry.addBreadcrumb({
    //     category: 'auth',
    //     message: eventType,
    //     data,
    //     level: 'info',
    //   });
    // }

    // Example implementation for Google Analytics
    // if (window.gtag) {
    //   window.gtag('event', eventType, {
    //     custom_parameter: data,
    //   });
    // }

    // For now, just store in localStorage for debugging
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push({ eventType, data, timestamp: new Date().toISOString() });
      localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }
}

export const analytics = new Analytics();