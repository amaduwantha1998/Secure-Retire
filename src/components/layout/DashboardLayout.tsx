import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { DashboardHeader } from './DashboardHeader';
import { DashboardRoutes } from './DashboardRoutes';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';
import { NavLink } from 'react-router-dom';
import {
  Home,
  DollarSign,
  FileText,
  Calculator,
  Settings,
} from 'lucide-react';

const navigationItems = [
  { title: 'Overview', url: '/dashboard', icon: Home },
  { title: 'Financial Management', url: '/dashboard/financial', icon: DollarSign },
  { title: 'Documents', url: '/dashboard/documents', icon: FileText },
  { title: 'Retirement Calculator', url: '/dashboard/calculator', icon: Calculator },
  { title: 'Investment Settings', url: '/dashboard/investments', icon: Settings },
];

export function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Enable real-time translation for all dashboard pages
  useRealTimeTranslation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 ml-sidebar">
          <DashboardHeader  />
          
          <main 
            className="flex-1 overflow-y-auto p-4 lg:p-6 transition-all duration-300"
            role="main"
            aria-label="Dashboard main content"
          >
            <div className="mx-auto max-w-7xl">
              <DashboardRoutes />
            </div>
          </main>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-border p-2 z-50">
          <div className="flex justify-around">
            {navigationItems.slice(0, 5).map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === '/dashboard'}
                className={({ isActive }) =>
                  `flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${
                    isActive
                      ? 'text-sidebar-active-foreground'
                      : 'text-sidebar-foreground hover:text-sidebar-active-foreground'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1 truncate">{item.title.split(' ')[0]}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}