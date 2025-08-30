import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RetirementProjection {
  totalNeeded: number;
  currentSavings: number;
  savingsGap: number;
  monthlyContributionNeeded: number;
  projectedPortfolioValue: number;
  successProbability: number;
  yearlyProjections: Array<{
    age: number;
    portfolioValue: number;
    contributions: number;
    withdrawals: number;
  }>;
  monteCarloResults: {
    percentile10: number;
    percentile50: number;
    percentile90: number;
    successRate: number;
  };
}

interface RetirementProjectionsProps {
  projection: RetirementProjection;
  currentAge: number;
  targetAge: number;
  desiredIncome: number;
}

export default function RetirementProjections({ 
  projection, 
  currentAge, 
  targetAge, 
  desiredIncome 
}: RetirementProjectionsProps) {
  const yearsToRetirement = targetAge - currentAge;
  
  const lineChartData = {
    labels: projection.yearlyProjections.map(p => p.age),
    datasets: [
      {
        label: 'Portfolio Value (90th percentile)',
        data: projection.yearlyProjections.map((_, index) => 
          projection.monteCarloResults.percentile90 * Math.pow(1.07, index)
        ),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Portfolio Value (Expected)',
        data: projection.yearlyProjections.map(p => p.portfolioValue),
        borderColor: 'hsl(var(--chart-2))',
        backgroundColor: 'hsl(var(--chart-2) / 0.1)',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Portfolio Value (10th percentile)',
        data: projection.yearlyProjections.map((_, index) => 
          projection.monteCarloResults.percentile10 * Math.pow(1.05, index)
        ),
        borderColor: 'hsl(var(--destructive))',
        backgroundColor: 'hsl(var(--destructive) / 0.1)',
        fill: false,
        tension: 0.1,
      }
    ]
  };

  const donutData = {
    labels: ['Current Savings', 'Additional Needed'],
    datasets: [{
      data: [projection.currentSavings, Math.max(0, projection.savingsGap)],
      backgroundColor: [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))'
      ],
      borderWidth: 2,
      borderColor: 'hsl(var(--background))'
    }]
  };

  const getSuccessIcon = () => {
    if (projection.successProbability >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (projection.successProbability >= 60) return <Target className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getSuccessColor = () => {
    if (projection.successProbability >= 80) return 'success';
    if (projection.successProbability >= 60) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Needed</p>
                <p className="text-2xl font-bold">{formatCurrency(projection.totalNeeded)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-chart-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(projection.currentSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-chart-2" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Needed</p>
                <p className="text-2xl font-bold">{formatCurrency(projection.monthlyContributionNeeded)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              {getSuccessIcon()}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{projection.successProbability.toFixed(0)}%</p>
                  <Badge variant={getSuccessColor() as any}>
                    {projection.successProbability >= 80 ? 'Good' : 
                     projection.successProbability >= 60 ? 'Fair' : 'Risk'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Growth Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={lineChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value as number);
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="w-64 h-64">
                <Doughnut 
                  data={donutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${formatCurrency(context.parsed)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monte Carlo Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Monte Carlo Simulation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Worst Case (10th percentile)</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(projection.monteCarloResults.percentile10)}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Expected (50th percentile)</p>
              <p className="text-xl font-bold">
                {formatCurrency(projection.monteCarloResults.percentile50)}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Best Case (90th percentile)</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(projection.monteCarloResults.percentile90)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Success Rate:</strong> {projection.monteCarloResults.successRate.toFixed(1)}% chance 
              of meeting your retirement income goal of {formatCurrency(desiredIncome)}/month over {yearsToRetirement} years.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}