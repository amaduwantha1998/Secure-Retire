import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut, Line } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PortfolioData {
  totalValue: number;
  dailyChange: number;
  totalReturn: number;
  allocations: Array<{
    asset_class: string;
    current_percentage: number;
    value: number;
  }>;
  performance: Array<{
    date: string;
    value: number;
  }>;
  riskMetrics: {
    expectedReturn: string;
    volatility: string;
    sharpeRatio: string;
    riskLevel: string;
  };
}

interface PortfolioOverviewProps {
  data: PortfolioData;
  loading?: boolean;
}

export default function PortfolioOverview({ data, loading }: PortfolioOverviewProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const allocationData = {
    labels: data.allocations.map(a => a.asset_class),
    datasets: [{
      data: data.allocations.map(a => a.current_percentage),
      backgroundColor: [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
      ],
      borderWidth: 2,
      borderColor: 'hsl(var(--background))'
    }]
  };

  const performanceData = {
    labels: data.performance.map(p => p.date),
    datasets: [{
      label: 'Portfolio Value',
      data: data.performance.map(p => p.value),
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      fill: true,
      tension: 0.1,
    }]
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getReturnIcon = () => {
    return data.dailyChange >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalValue)}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Change</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${data.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.dailyChange >= 0 ? '+' : ''}{data.dailyChange.toFixed(2)}%
                  </p>
                  {getReturnIcon()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${data.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.totalReturn >= 0 ? '+' : ''}{data.totalReturn.toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${getRiskColor(data.riskMetrics.riskLevel)}`}>
                    {data.riskMetrics.riskLevel}
                  </p>
                  <Badge variant="outline">{data.riskMetrics.volatility}%</Badge>
                </div>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="w-64 h-64">
                <Doughnut 
                  data={allocationData}
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
                            return `${context.label}: ${context.parsed}%`;
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

        <Card>
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={performanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value as number);
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Value: ${formatCurrency(context.parsed.y)}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Risk & Return Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Expected Annual Return</p>
              <p className="text-2xl font-bold text-green-600">{data.riskMetrics.expectedReturn}%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Volatility (Risk)</p>
              <p className={`text-2xl font-bold ${getRiskColor(data.riskMetrics.riskLevel)}`}>
                {data.riskMetrics.volatility}%
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
              <p className="text-2xl font-bold">{data.riskMetrics.sharpeRatio}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}