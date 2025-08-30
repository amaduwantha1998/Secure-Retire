import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calculator } from 'lucide-react';
import { CreditGuard } from '@/components/credits/CreditGuard';
import { getCreditOperation } from '@/utils/creditOperations';

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

interface RetirementCalculatorFormProps {
  onCalculate: (goals: RetirementGoals) => void;
  loading: boolean;
}

export default function RetirementCalculatorForm({ onCalculate, loading }: RetirementCalculatorFormProps) {
  const [goals, setGoals] = useState<RetirementGoals>({
    targetRetirementAge: 65,
    currentAge: 35,
    desiredMonthlyIncome: 5000,
    inflationRate: 3,
    expectedReturn: 7,
    riskTolerance: 'moderate',
    lifestyleLevel: 'comfortable',
    region: 'US'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(goals);
  };

  const lifestyleMultipliers = {
    basic: 0.7,
    comfortable: 1.0,
    luxury: 1.5
  };

  const riskProfiles = {
    conservative: { return: 5, volatility: 8 },
    moderate: { return: 7, volatility: 12 },
    aggressive: { return: 9, volatility: 18 }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirement Planning Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                value={goals.currentAge}
                onChange={(e) => setGoals({ ...goals, currentAge: parseInt(e.target.value) || 35 })}
                min="18"
                max="80"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetAge">Target Retirement Age</Label>
              <Input
                id="targetAge"
                type="number"
                value={goals.targetRetirementAge}
                onChange={(e) => setGoals({ ...goals, targetRetirementAge: parseInt(e.target.value) || 65 })}
                min="50"
                max="85"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Desired Monthly Income (Retirement)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={goals.desiredMonthlyIncome}
                onChange={(e) => setGoals({ ...goals, desiredMonthlyIncome: parseInt(e.target.value) || 5000 })}
                min="1000"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={goals.region} onValueChange={(value) => setGoals({ ...goals, region: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lifestyle Level</Label>
              <Select value={goals.lifestyleLevel} onValueChange={(value: any) => setGoals({ ...goals, lifestyleLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (70% of current income)</SelectItem>
                  <SelectItem value="comfortable">Comfortable (100% of current income)</SelectItem>
                  <SelectItem value="luxury">Luxury (150% of current income)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Tolerance</Label>
              <Select value={goals.riskTolerance} onValueChange={(value: any) => setGoals({ ...goals, riskTolerance: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (5% return, 8% volatility)</SelectItem>
                  <SelectItem value="moderate">Moderate (7% return, 12% volatility)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (9% return, 18% volatility)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Expected Annual Return: {goals.expectedReturn}%</Label>
              <Slider
                value={[goals.expectedReturn]}
                onValueChange={([value]) => setGoals({ ...goals, expectedReturn: value })}
                min={3}
                max={12}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label>Inflation Rate: {goals.inflationRate}%</Label>
              <Slider
                value={[goals.inflationRate]}
                onValueChange={([value]) => setGoals({ ...goals, inflationRate: value })}
                min={1}
                max={6}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <CreditGuard
            operation={getCreditOperation('RETIREMENT_CALCULATION')}
            onProceed={async () => {
              onCalculate(goals);
            }}
          >
            <Button type="button" className="w-full" disabled={loading}>
              <Calculator className="h-4 w-4 mr-2" />
              {loading ? 'Calculating...' : 'Calculate Retirement Plan'}
            </Button>
          </CreditGuard>
        </form>
      </CardContent>
    </Card>
  );
}