import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  DollarSign,
  FileText,
  Calculator,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  Home,
  Shield,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

const navigationItems = [
  { title: 'Overview', url: '/dashboard', icon: Home },
  { title: 'Financial Management', url: '/dashboard/financial', icon: DollarSign },
  { title: 'Documents', url: '/dashboard/documents', icon: FileText },
  { title: 'Retirement Calculator', url: '/dashboard/calculator', icon: Calculator },
  { title: 'Investment Settings', url: '/dashboard/investments', icon: TrendingUp },
  { title: 'Beneficiaries', url: '/dashboard/beneficiaries', icon: Users },
  { title: 'Consultations', url: '/dashboard/consultations', icon: Calendar },
  { title: 'Profile Settings', url: '/dashboard/profile', icon: Settings },
  { title: 'Help Center', url: '/dashboard/help', icon: HelpCircle },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/dashboard/overview';
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const baseClasses = 'flex items-center gap-3 px-4 py-3 text-body font-normal rounded-lg transition-all duration-200';
    return isActive(path)
      ? `${baseClasses} bg-sidebar-active text-sidebar-active-foreground font-semibold`
      : `${baseClasses} text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground`;
  };

  const getIconClassName = (path: string) => {
    return isActive(path)
      ? 'h-5 w-5 flex-shrink-0 text-sidebar-active-foreground'
      : 'h-5 w-5 flex-shrink-0 text-sidebar-foreground';
  };
  
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-sidebar bg-sidebar border-r border-border overflow-y-auto z-40"
      role="navigation"
      aria-label="Dashboard navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-start p-6 ">
        <Logo size="brand" className="flex-shrink-0" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          {navigationItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === '/dashboard'}
                className={getNavClassName(item.url)}
              >
                <item.icon className={getIconClassName(item.url)} />
                <span className="truncate">{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}