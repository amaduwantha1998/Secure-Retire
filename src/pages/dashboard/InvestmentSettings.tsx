import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, PieChart, Settings, AlertCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PortfolioOverview from '@/components/investment/PortfolioOverview';
import InvestmentOptions from '@/components/investment/InvestmentOptions';
import RebalancingRecommendations from '@/components/investment/RebalancingRecommendations';
import { useInvestmentData } from '@/hooks/useInvestmentData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function InvestmentSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    investmentOptions,
    portfolioOverview,
    recommendations,
    loading,
    recommendationsLoading,
    generateRecommendations,
    addToPortfolio,
    applyRebalancing,
    addToPortfolioLoading,
    applyRebalancingLoading,
    error
  } = useInvestmentData();

  const handleAddToPortfolio = async (option: any, amount: number) => {
    try {
      await addToPortfolio({ option, amount });
      toast({
        title: "Investment Added",
        description: `Successfully added ${option.symbol} to your portfolio.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add investment to portfolio.",
        variant: "destructive",
      });
    }
  };

  const handleRebalance = async (recommendations: any[]) => {
    try {
      await applyRebalancing(recommendations);
      toast({
        title: "Portfolio Rebalanced",
        description: "Your portfolio has been successfully rebalanced.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rebalance portfolio.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateRecommendations = () => {
    generateRecommendations({ riskTolerance: 3 });
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Investment Settings</h1>
          <p className="text-muted-foreground">
            Manage your investment portfolio with AI-powered insights and global investment options.
          </p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access investment management features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Investment Settings</h1>
          <p className="text-muted-foreground">
            Manage your investment portfolio with AI-powered insights and global investment options.
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load investment data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Investment Settings</h1>
        <p className="text-muted-foreground">
          Manage your investment portfolio with AI-powered insights and global investment options.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Portfolio Overview
          </TabsTrigger>
          <TabsTrigger value="investments" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Investment Options
          </TabsTrigger>
          <TabsTrigger value="rebalancing" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            AI Rebalancing
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PortfolioOverview data={portfolioOverview} loading={loading} />
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <InvestmentOptions
            options={investmentOptions}
            onAddToPortfolio={handleAddToPortfolio}
            loading={loading || addToPortfolioLoading}
          />
        </TabsContent>

        <TabsContent value="rebalancing" className="space-y-6">
          <RebalancingRecommendations
            data={recommendations}
            loading={recommendationsLoading || applyRebalancingLoading}
            onRebalance={handleRebalance}
            onRefresh={handleGenerateRecommendations}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Tolerance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Adjust your risk tolerance to receive personalized investment recommendations.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-full w-3/5 bg-primary rounded-full" />
                  </div>
                  <p className="text-sm text-muted-foreground">Currently: Moderate</p>
                </div>
                <Button variant="outline" className="w-full">
                  Update Risk Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto-Rebalancing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Automatically rebalance your portfolio when allocations drift beyond set thresholds.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auto-rebalancing</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Threshold</span>
                    <span className="text-sm text-muted-foreground">5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Frequency</span>
                    <span className="text-sm text-muted-foreground">Quarterly</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Optimize your portfolio for tax efficiency and harvest losses automatically.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tax-loss harvesting</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tax-efficient funds</span>
                    <span className="text-sm text-muted-foreground">Preferred</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ESG Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Include Environmental, Social, and Governance criteria in investment selection.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ESG screening</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Impact investing</span>
                    <span className="text-sm text-muted-foreground">Optional</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}