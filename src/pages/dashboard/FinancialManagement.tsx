import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  Plus,
  AlertTriangle,
  Calculator,
  BarChart3
} from 'lucide-react';
import { 
  getIncomeSourcesAPI,
  getAssetsAPI,
  getDebtsAPI,
  getRetirementSavingsAPI
} from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { formatCurrency } from '@/lib/utils';

// Lazy load tab components for better performance
const IncomeTab = lazy(() => import('@/components/financial/IncomeTab'));
const AssetsTab = lazy(() => import('@/components/financial/AssetsTab'));
const DebtsTab = lazy(() => import('@/components/financial/DebtsTab'));
const RetirementTab = lazy(() => import('@/components/financial/RetirementTab'));
const BudgetTracker = lazy(() => import('@/components/financial/BudgetTracker'));
const TaxEstimator = lazy(() => import('@/components/financial/TaxEstimator'));

export default function FinancialManagement() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const { dt } = useDynamicTranslation();
  const [activeTab, setActiveTab] = useState('income');

  useEffect(() => {
    console.log('FinancialManagement component mounted');
    console.log('User:', user?.id);
  }, [user]);

  // Early return if no user
  if (!user) {
    console.log('No user found in FinancialManagement');
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access financial management features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch all financial data
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['income-sources', user?.id],
    queryFn: getIncomeSourcesAPI,
    enabled: !!user?.id,
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: getAssetsAPI,
    enabled: !!user?.id,
  });

  const { data: debtsData, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: getDebtsAPI,
    enabled: !!user?.id,
  });

  const { data: retirementData, isLoading: retirementLoading } = useQuery({
    queryKey: ['retirement-savings', user?.id],
    queryFn: getRetirementSavingsAPI,
    enabled: !!user?.id,
  });

  // Calculate totals
  const totalMonthlyIncome = incomeData?.reduce((sum, income) => {
    const multiplier = income.frequency === 'monthly' ? 1 : 
                     income.frequency === 'biweekly' ? 2.17 :
                     income.frequency === 'weekly' ? 4.33 : 12;
    return sum + (Number(income.amount) * multiplier);
  }, 0) || 0;

  const totalAssets = assetsData?.reduce((sum, asset) => sum + Number(asset.amount), 0) || 0;
  const totalDebts = debtsData?.reduce((sum, debt) => sum + Number(debt.balance), 0) || 0;
  const totalRetirement = retirementData?.reduce((sum, account) => sum + Number(account.balance), 0) || 0;

  const netWorth = totalAssets - totalDebts;
  const debtToIncomeRatio = totalMonthlyIncome > 0 ? (totalDebts / (totalMonthlyIncome * 12)) * 100 : 0;

  const isLoading = incomeLoading || assetsLoading || debtsLoading || retirementLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{dt('Financial Management')}</h1>
        <p className="text-muted-foreground">
          {dt('Comprehensive overview and management of your financial portfolio.')}
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dt('Monthly Income')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatAmount(totalMonthlyIncome)}</div>
                <p className="text-xs text-muted-foreground">
                  {incomeData?.length || 0} sources
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAmount(netWorth)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Assets - Liabilities
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dt('Total Assets')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatAmount(totalAssets)}</div>
                <p className="text-xs text-muted-foreground">
                  {assetsData?.length || 0} accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dt('Retirement Savings')}</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatAmount(totalRetirement)}</div>
                <p className="text-xs text-muted-foreground">
                  {retirementData?.length || 0} accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {debtToIncomeRatio > 36 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your debt-to-income ratio is {debtToIncomeRatio.toFixed(1)}%, which is above the recommended 36%. 
            Consider focusing on debt reduction strategies.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="income" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {dt('Income')}
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {dt('Assets')}
          </TabsTrigger>
          <TabsTrigger value="debts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {dt('Debts')}
          </TabsTrigger>
          <TabsTrigger value="retirement" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            {dt('Retirement')}
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {dt('Budget')}
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {dt('Tax')}
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}</div>}>
          <TabsContent value="income" className="space-y-4">
            <IncomeTab data={incomeData} isLoading={incomeLoading} />
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <AssetsTab data={assetsData} isLoading={assetsLoading} />
          </TabsContent>

          <TabsContent value="debts" className="space-y-4">
            <DebtsTab data={debtsData} isLoading={debtsLoading} />
          </TabsContent>

          <TabsContent value="retirement" className="space-y-4">
            <RetirementTab data={retirementData} isLoading={retirementLoading} />
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <BudgetTracker 
              monthlyIncome={totalMonthlyIncome}
              totalDebts={totalDebts}
            />
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            <TaxEstimator 
              annualIncome={totalMonthlyIncome * 12}
              deductions={totalRetirement}
            />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  );
}