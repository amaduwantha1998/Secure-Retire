import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RetirementCalculatorForm from '@/components/financial/RetirementCalculatorForm';
import RetirementProjections from '@/components/financial/RetirementProjections';
import { useRetirementCalculator } from '@/hooks/useRetirementCalculator';
import { useAuth } from '@/contexts/AuthContext';
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

interface RetirementGoals {
  targetRetirementAge: number;
  currentAge: number;
  desiredMonthlyIncome: number;
  inflationRate: number;
  expectedReturn: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  lifestyleLevel: 'basic' | 'comfortable' | 'luxury';
  region: string;
}

export default function RetirementCalculator() {
  const { user } = useAuth();
  const { loading, projection, calculateRetirement } = useRetirementCalculator();
  const [activeTab, setActiveTab] = useState('calculator');
  const [currentGoals, setCurrentGoals] = useState<RetirementGoals | null>(null);

  const handleCalculate = async (goals: RetirementGoals) => {
    setCurrentGoals(goals);
    try {
      await calculateRetirement(goals);
      setActiveTab('results');
    } catch (error) {
      console.error('Failed to calculate retirement:', error);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Retirement Calculator</h1>
          <p className="text-muted-foreground">
            Calculate how much you need to save for a comfortable retirement.
          </p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the retirement calculator and your financial data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Retirement Calculator</h1>
        <p className="text-muted-foreground">
          Plan your retirement with Monte Carlo simulations and personalized projections.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!projection} className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <RetirementCalculatorForm 
            onCalculate={handleCalculate}
            loading={loading}
          />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Monte Carlo Simulation</h4>
                  <p className="text-sm text-muted-foreground">
                    Runs 1,000 different market scenarios to show the range of possible outcomes for your retirement portfolio.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Regional Adjustments</h4>
                  <p className="text-sm text-muted-foreground">
                    Accounts for different tax rates, inflation patterns, and social security benefits by region.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">4% Withdrawal Rule</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on the safe withdrawal rate research, ensuring your money lasts throughout retirement.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Start Early</h4>
                  <p className="text-sm text-muted-foreground">
                    The power of compound interest means starting even a few years earlier can dramatically impact your results.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Diversify Investments</h4>
                  <p className="text-sm text-muted-foreground">
                    A balanced portfolio reduces risk while maintaining growth potential over the long term.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Review Regularly</h4>
                  <p className="text-sm text-muted-foreground">
                    Update your calculations annually or when major life changes occur.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {projection && currentGoals ? (
            <RetirementProjections 
              projection={projection}
              currentAge={currentGoals.currentAge}
              targetAge={currentGoals.targetRetirementAge}
              desiredIncome={currentGoals.desiredMonthlyIncome}
            />
          ) : (
            <Card>
              <CardContent className="text-center p-12">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete the retirement calculator to see your personalized projections and Monte Carlo analysis.
                </p>
                <Button onClick={() => setActiveTab('calculator')}>
                  Go to Calculator
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Compare different retirement scenarios and see how changes affect your outcome.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Early Retirement (Age 55)</h4>
                  <p className="text-sm text-muted-foreground">
                    See what it takes to retire 10 years early with FIRE strategies.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Conservative Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    Lower risk investments with more predictable but modest returns.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Aggressive Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Higher risk, higher reward approach for maximum portfolio growth.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Delayed Retirement</h4>
                  <p className="text-sm text-muted-foreground">
                    Benefits of working a few extra years on your retirement security.
                  </p>
                </div>
              </div>
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Advanced scenario planning features are coming soon. This will include side-by-side comparisons and sensitivity analysis.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}