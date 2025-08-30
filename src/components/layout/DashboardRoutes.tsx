import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Overview from '@/pages/Overview';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load dashboard sub-pages for better performance
const FinancialManagement = React.lazy(() => import('@/pages/dashboard/FinancialManagement'));
const DocumentsHandling = React.lazy(() => import('@/pages/dashboard/DocumentsHandling'));
const RetirementCalculator = React.lazy(() => import('@/pages/dashboard/RetirementCalculator'));
const InvestmentSettings = React.lazy(() => import('@/pages/dashboard/InvestmentSettings'));
const BeneficiariesPage = React.lazy(() => import('@/pages/dashboard/BeneficiariesPage'));
const Consultations = React.lazy(() => import('@/pages/dashboard/Consultations'));
const ProfileSettings = React.lazy(() => import('@/pages/dashboard/ProfileSettings'));
const HelpCenter = React.lazy(() => import('@/pages/dashboard/HelpCenter'));

export function DashboardRoutes() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />
          <Route path="financial" element={<FinancialManagement />} />
          <Route path="documents" element={<DocumentsHandling />} />
          <Route path="calculator" element={<RetirementCalculator />} />
          <Route path="investments" element={<InvestmentSettings />} />
          <Route path="beneficiaries" element={<BeneficiariesPage />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="help" element={<HelpCenter />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  );
}