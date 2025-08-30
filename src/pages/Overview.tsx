import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertCircle,
  Download,
  RefreshCw,
  Lightbulb,
  Calendar,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialDataService, FinancialData, FinancialSummary } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface AIInsight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionAmount?: number;
}

export default function Overview() {
  const { t } = useTranslation();
  const { dt } = useDynamicTranslation();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch financial data
  const {
    data: financialData,
    isLoading,
    isError,
    refetch,
  } = useQuery<FinancialData>({
    queryKey: ['financial-data'],
    queryFn: FinancialDataService.fetchFinancialData,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Calculate financial summary
  const financialSummary = React.useMemo(() => {
    if (!financialData) return null;
    return FinancialDataService.calculateFinancialSummary(financialData);
  }, [financialData]);

  // Generate AI insights
  const generateAIInsights = async () => {
    if (!financialSummary || !financialData) return;

    setLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-financial-insights', {
        body: {
          financialProfile: {
            netWorth: financialSummary.netWorth,
            monthlyIncome: financialSummary.monthlyIncome,
            monthlySavings: financialSummary.monthlySavings,
            totalDebts: financialSummary.totalDebts,
            debtToIncomeRatio: financialSummary.debtToIncomeRatio,
            retirementReadinessScore: financialSummary.retirementReadinessScore,
            age: FinancialDataService.calculateAge(financialData.user?.date_of_birth),
            currency: 'LKR', // Use LKR as default for AI insights
          },
        },
      });

      if (error) throw error;
      setAiInsights(data.insights || []);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: 'AI Insights Error',
        description: 'Unable to generate AI insights. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  // Generate insights on data load
  useEffect(() => {
    if (financialSummary && aiInsights.length === 0) {
      generateAIInsights();
    }
  }, [financialSummary]);

  // Export to PDF
  const exportToPDF = () => {
    if (!financialSummary || !financialData) return;

    const pdf = new jsPDF();
    // Title
    pdf.setFontSize(20);
    pdf.text('Financial Overview Report', 20, 30);
    
    // Date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Financial Summary
    pdf.setFontSize(16);
    pdf.text('Financial Summary', 20, 65);
    
    pdf.setFontSize(12);
    const summaryText = [
      `Net Worth: ${formatAmount(financialSummary.netWorth)}`,
      `Monthly Income: ${formatAmount(financialSummary.monthlyIncome)}`,
      `Monthly Savings: ${formatAmount(financialSummary.monthlySavings)}`,
      `Total Debts: ${formatAmount(financialSummary.totalDebts)}`,
      `Debt-to-Income Ratio: ${financialSummary.debtToIncomeRatio.toFixed(1)}%`,
      `Retirement Readiness Score: ${financialSummary.retirementReadinessScore}/100`,
    ];
    
    summaryText.forEach((text, index) => {
      pdf.text(text, 20, 80 + (index * 10));
    });

    // AI Insights
    if (aiInsights.length > 0) {
      pdf.setFontSize(16);
      pdf.text('AI-Powered Insights', 20, 160);
      
      pdf.setFontSize(12);
      aiInsights.forEach((insight, index) => {
        const y = 175 + (index * 25);
        pdf.text(`${index + 1}. ${insight.title}`, 20, y);
        
        // Split long descriptions
        const lines = pdf.splitTextToSize(insight.description, 170);
        lines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, 25, y + 8 + (lineIndex * 6));
        });
      });
    }

    pdf.save('financial-overview.pdf');
    toast({
      title: 'PDF Exported',
      description: 'Your financial overview has been exported successfully.',
    });
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !financialData || !financialSummary) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load financial data. Please try refreshing the page or contact support.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // Chart data for Net Worth
  const netWorthChartData = {
    labels: ['Assets', 'Retirement', 'Debts'],
    datasets: [
      {
        data: [
          Math.max(financialSummary.totalAssets, 0),
          Math.max(financialData.retirementSavings.reduce((sum, s) => sum + (s.balance || 0), 0), 0),
          Math.max(financialSummary.totalDebts, 0),
        ],
        backgroundColor: [
          'hsl(var(--primary))',
          'hsl(var(--success))',
          'hsl(var(--destructive))',
        ],
        borderWidth: 2,
        borderColor: 'hsl(var(--background))',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
          return `${context.label}: ${formatAmount(context.raw)}`;
          },
        },
      },
    },
  };

  // Upcoming actions (mock data for now)
  const upcomingActions = [
    {
      id: 1,
      type: 'bill',
      title: 'Credit Card Payment Due',
      description: 'Payment due in 3 days',
      amount: 450,
      priority: 'high' as const,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      type: 'document',
      title: 'Upload Tax Documents',
      description: 'Annual tax filing deadline approaching',
      priority: 'medium' as const,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      type: 'review',
      title: 'Portfolio Review',
      description: 'Quarterly investment review',
      priority: 'low' as const,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{dt('Financial Overview')}</h1>
          <p className="text-muted-foreground">
            {dt('Your complete financial health dashboard with AI-powered insights')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {dt('Refresh')}
          </Button>
          <Button onClick={exportToPDF} data-testid="export-pdf">
            <Download className="h-4 w-4 mr-2" />
            {dt('Export PDF')}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dt('Net Worth')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="net-worth">
              {formatAmount(financialSummary.netWorth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.netWorth >= 0 ? (
                <span className="text-success flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Positive net worth
                </span>
              ) : (
                <span className="text-destructive flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Needs improvement
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="monthly-income">
              {formatAmount(financialSummary.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {financialData.incomeSources.length} source(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt-to-Income</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialSummary.debtToIncomeRatio.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.debtToIncomeRatio <= 36 ? (
                <span className="text-success">Healthy ratio</span>
              ) : (
                <span className="text-destructive">Consider reducing</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="monthly-savings">
              {formatAmount(financialSummary.monthlySavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((financialSummary.monthlySavings / Math.max(financialSummary.monthlyIncome, 1)) * 100).toFixed(1)}% of income
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Net Worth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Net Worth Breakdown</CardTitle>
            <CardDescription>
              Visual breakdown of your assets vs. liabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center" data-testid="net-worth-chart">
              {financialSummary.totalAssets > 0 || financialSummary.totalDebts > 0 ? (
                <Pie data={netWorthChartData} options={chartOptions} />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>No financial data to display</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => navigate('/dashboard/financial')}
                  >
                    Add Financial Data
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Retirement Readiness */}
        <Card>
          <CardHeader>
            <CardTitle>Retirement Readiness Score</CardTitle>
            <CardDescription>
              Based on your current savings, income, and debt situation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(financialSummary.retirementReadinessScore)}`}>
                {financialSummary.retirementReadinessScore}/100
              </div>
              <Progress 
                value={financialSummary.retirementReadinessScore} 
                className="mt-4"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Score Range:</p>
                <p className="font-medium">
                  {financialSummary.retirementReadinessScore >= 80 ? 'Excellent' :
                   financialSummary.retirementReadinessScore >= 60 ? 'Good' :
                   financialSummary.retirementReadinessScore >= 40 ? 'Fair' : 'Needs Work'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Target:</p>
                <p className="font-medium">80+ (Recommended)</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/dashboard/calculator')}
            >
              <Target className="h-4 w-4 mr-2" />
              Improve Score
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card data-testid="ai-insights">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your financial profile
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={generateAIInsights}
            disabled={loadingInsights}
            data-testid="refresh-insights"
          >
            {loadingInsights ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4 mr-2" />
            )}
            {loadingInsights ? 'Generating...' : 'Refresh Insights'}
          </Button>
        </CardHeader>
        <CardContent>
          {aiInsights.length > 0 ? (
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  {insight.actionAmount && (
                    <div className="text-sm font-medium text-primary">
                      Suggested action: {formatAmount(insight.actionAmount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Refresh Insights" to get AI-powered financial recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Actions
          </CardTitle>
          <CardDescription>
            Important tasks and deadlines to keep track of
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingActions.map((action, index) => (
              <div key={action.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {action.type === 'bill' && <DollarSign className="h-4 w-4 text-destructive" />}
                      {action.type === 'document' && <FileText className="h-4 w-4 text-warning" />}
                      {action.type === 'review' && <Target className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.title}</span>
                        <Badge variant={getPriorityColor(action.priority)} className="text-xs">
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {action.amount && (
                      <div className="font-semibold">
                        {formatAmount(action.amount)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Due: {action.dueDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {index < upcomingActions.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}