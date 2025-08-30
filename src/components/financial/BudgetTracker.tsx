import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Heart, 
  Car, 
  ShoppingCart, 
  Coffee, 
  Plane, 
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  budgeted: number;
  spent: number;
  percentage: number;
}

interface BudgetTrackerProps {
  monthlyIncome: number;
  totalDebts: number;
}

export default function BudgetTracker({ monthlyIncome, totalDebts }: BudgetTrackerProps) {
  const [customBudgets, setCustomBudgets] = useState<{ [key: string]: number }>({});

  // Recommended budget percentages based on 50/30/20 rule
  const recommendedPercentages = {
    housing: 30,
    healthcare: 8,
    transportation: 15,
    food: 12,
    entertainment: 8,
    shopping: 5,
    travel: 5,
    savings: 20,
  };

  const initialCategories: BudgetCategory[] = [
    {
      id: 'housing',
      name: 'Housing & Utilities',
      icon: <Home className="h-5 w-5" />,
      budgeted: customBudgets.housing || (monthlyIncome * recommendedPercentages.housing) / 100,
      spent: (monthlyIncome * recommendedPercentages.housing * 0.75) / 100, // Mock data
      percentage: recommendedPercentages.housing,
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: <Heart className="h-5 w-5" />,
      budgeted: customBudgets.healthcare || (monthlyIncome * recommendedPercentages.healthcare) / 100,
      spent: (monthlyIncome * recommendedPercentages.healthcare * 0.60) / 100,
      percentage: recommendedPercentages.healthcare,
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: <Car className="h-5 w-5" />,
      budgeted: customBudgets.transportation || (monthlyIncome * recommendedPercentages.transportation) / 100,
      spent: (monthlyIncome * recommendedPercentages.transportation * 0.85) / 100,
      percentage: recommendedPercentages.transportation,
    },
    {
      id: 'food',
      name: 'Food & Groceries',
      icon: <ShoppingCart className="h-5 w-5" />,
      budgeted: customBudgets.food || (monthlyIncome * recommendedPercentages.food) / 100,
      spent: (monthlyIncome * recommendedPercentages.food * 0.90) / 100,
      percentage: recommendedPercentages.food,
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: <Coffee className="h-5 w-5" />,
      budgeted: customBudgets.entertainment || (monthlyIncome * recommendedPercentages.entertainment) / 100,
      spent: (monthlyIncome * recommendedPercentages.entertainment * 1.10) / 100,
      percentage: recommendedPercentages.entertainment,
    },
    {
      id: 'travel',
      name: 'Travel',
      icon: <Plane className="h-5 w-5" />,
      budgeted: customBudgets.travel || (monthlyIncome * recommendedPercentages.travel) / 100,
      spent: (monthlyIncome * recommendedPercentages.travel * 0.40) / 100,
      percentage: recommendedPercentages.travel,
    },
  ];

  const [categories, setCategories] = useState(initialCategories);

  const updateBudget = (categoryId: string, amount: number) => {
    setCustomBudgets(prev => ({ ...prev, [categoryId]: amount }));
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, budgeted: amount } : cat
      )
    );
  };

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const getSpentColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage > 100) return 'text-red-600';
    if (percentage > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const overspentCategories = categories.filter(cat => cat.spent > cat.budgeted);
  const remainingBudget = monthlyIncome - totalBudgeted;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">Available for budgeting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
            <p className="text-xs text-muted-foreground">
              {remainingBudget >= 0 ? `${formatCurrency(remainingBudget)} remaining` : `${formatCurrency(Math.abs(remainingBudget))} over budget`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization.toFixed(1)}%</div>
            <Progress value={Math.min(budgetUtilization, 100)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Spending Alerts */}
      {overspentCategories.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You're over budget in {overspentCategories.length} categories: {' '}
            {overspentCategories.map(cat => cat.name).join(', ')}. 
            Consider adjusting your spending or budget allocations.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Budget Overview</TabsTrigger>
          <TabsTrigger value="customize">Customize Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {category.icon}
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {category.percentage}% of income recommended
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Budgeted</p>
                      <p className="font-semibold">{formatCurrency(category.budgeted)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${getSpentColor(category.spent, category.budgeted)}`}>
                        {formatCurrency(category.spent)} spent
                      </span>
                      <Badge variant={category.spent > category.budgeted ? "destructive" : "secondary"}>
                        {((category.spent / category.budgeted) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.min((category.spent / category.budgeted) * 100, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Math.max(0, category.budgeted - category.spent))} remaining
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customize Budget Allocations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjust your budget amounts for each category. Recommended percentages are shown as guidance.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 min-w-[200px]">
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`budget-${category.id}`} className="sr-only">
                      Budget for {category.name}
                    </Label>
                    <Input
                      id={`budget-${category.id}`}
                      type="number"
                      step="0.01"
                      value={category.budgeted}
                      onChange={(e) => updateBudget(category.id, parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                  </div>
                  <Badge variant="outline">
                    {category.percentage}% recommended
                  </Badge>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Allocated:</span>
                  <span className="text-lg font-bold">{formatCurrency(totalBudgeted)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">Remaining Income:</span>
                  <span className={`text-sm font-medium ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(remainingBudget)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}