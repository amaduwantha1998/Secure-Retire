import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';

interface Recommendation {
  asset_class: string;
  symbol: string;
  name: string;
  current_percentage: number;
  target_percentage: number;
  deviation: number;
  action: 'increase' | 'decrease';
  priority: 'high' | 'medium' | 'low';
  rationale: string;
}

interface RebalancingData {
  current_metrics: {
    expectedReturn: string;
    volatility: string;
    sharpeRatio: string;
    riskLevel: string;
  };
  recommendations: Recommendation[];
  improvement_potential: {
    return_improvement: string;
    risk_reduction: string;
    efficiency_gain: string;
  };
  market_outlook: {
    sentiment: string;
    key_factors: string[];
  };
}

interface RebalancingRecommendationsProps {
  data: RebalancingData | null;
  loading: boolean;
  onRebalance: (recommendations: Recommendation[]) => void;
  onRefresh: () => void;
}

export default function RebalancingRecommendations({
  data,
  loading,
  onRebalance,
  onRefresh
}: RebalancingRecommendationsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Rebalancing Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Rebalancing Analysis</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground mb-4">
            Run an analysis to get personalized rebalancing recommendations.
          </p>
          <Button onClick={onRefresh}>
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const hasRecommendations = data.recommendations.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI-Powered Rebalancing Analysis
            <Button variant="outline" onClick={onRefresh}>
              Refresh Analysis
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasRecommendations ? (
            <div className="space-y-6">
              {/* Current vs Optimized Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Expected Return</p>
                  <p className="text-xl font-bold text-green-600">
                    {data.current_metrics.expectedReturn}%
                  </p>
                  {parseFloat(data.improvement_potential.return_improvement) > 0 && (
                    <p className="text-xs text-green-600">
                      +{data.improvement_potential.return_improvement}% potential
                    </p>
                  )}
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Portfolio Risk</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {data.current_metrics.volatility}%
                  </p>
                  {parseFloat(data.improvement_potential.risk_reduction) > 0 && (
                    <p className="text-xs text-green-600">
                      -{data.improvement_potential.risk_reduction}% reduction
                    </p>
                  )}
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                  <p className="text-xl font-bold">
                    {data.current_metrics.sharpeRatio}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.improvement_potential.efficiency_gain}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rebalancing Recommendations</h3>
                {data.recommendations.map((rec, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getPriorityIcon(rec.priority)}
                            <h4 className="font-semibold">{rec.asset_class}</h4>
                            <Badge variant={getPriorityColor(rec.priority) as any}>
                              {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                            </Badge>
                            <Badge variant="outline">
                              {rec.action === 'increase' ? '+' : '-'}{rec.deviation.toFixed(1)}%
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{rec.rationale}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Current: {rec.current_percentage.toFixed(1)}%</span>
                              <span>Target: {rec.target_percentage.toFixed(1)}%</span>
                            </div>
                            <Progress 
                              value={rec.current_percentage} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={() => onRebalance(data.recommendations)}
                  size="lg"
                  className="px-8"
                >
                  Apply Rebalancing Recommendations
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Portfolio Already Optimized</h3>
              <p className="text-muted-foreground">
                Your current allocation is well-balanced for your risk profile. No rebalancing needed at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Outlook */}
      <Card>
        <CardHeader>
          <CardTitle>Market Outlook & Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{data.market_outlook.sentiment}</Badge>
              <span className="text-sm text-muted-foreground">Current Market Sentiment</span>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Key Market Factors:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.market_outlook.key_factors.map((factor, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}