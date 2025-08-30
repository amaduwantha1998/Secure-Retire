import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { Star, TrendingUp, Shield, Globe } from 'lucide-react';
import { CreditGuard } from '@/components/credits/CreditGuard';
import { getCreditOperation } from '@/utils/creditOperations';

interface InvestmentOption {
  id: string;
  symbol: string;
  name: string;
  type: string;
  asset_class: string;
  expense_ratio: number;
  region: string;
  risk_level: number;
  description: string;
  performance_1y: number;
  performance_3y: number;
  performance_5y: number;
}

interface InvestmentOptionsProps {
  options: InvestmentOption[];
  onAddToPortfolio: (option: InvestmentOption, amount: number) => void;
  loading?: boolean;
}

export default function InvestmentOptions({ options, onAddToPortfolio, loading }: InvestmentOptionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [selectedAmounts, setSelectedAmounts] = useState<Record<string, number>>({});

  const filteredOptions = options.filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.asset_class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || option.type === filterType;
    const matchesRegion = filterRegion === 'all' || option.region === filterRegion;
    
    return matchesSearch && matchesType && matchesRegion;
  });

  const handleAmountChange = (optionId: string, amount: number) => {
    setSelectedAmounts(prev => ({ ...prev, [optionId]: amount }));
  };

  const handleAddToPortfolio = (option: InvestmentOption) => {
    const amount = selectedAmounts[option.id] || 1000;
    onAddToPortfolio(option, amount);
    setSelectedAmounts(prev => ({ ...prev, [option.id]: 0 }));
  };

  const getRiskColor = (level: number) => {
    if (level <= 2) return 'text-green-600 bg-green-50';
    if (level <= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskLabel = (level: number) => {
    if (level <= 2) return 'Low';
    if (level <= 3) return 'Medium';
    return 'High';
  };

  const getPerformanceColor = (performance: number) => {
    return performance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const etfs = filteredOptions.filter(option => option.type === 'etf');
  const bonds = filteredOptions.filter(option => option.type === 'bond' || option.asset_class.includes('Bond'));
  const stocks = filteredOptions.filter(option => option.type === 'stock');

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Universe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="etf">ETFs</SelectItem>
                <SelectItem value="bond">Bonds</SelectItem>
                <SelectItem value="stock">Stocks</SelectItem>
                <SelectItem value="mutual_fund">Mutual Funds</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="Asia">Asia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Investment Options */}
      <Tabs defaultValue="etfs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="etfs">ETFs ({etfs.length})</TabsTrigger>
          <TabsTrigger value="bonds">Bonds ({bonds.length})</TabsTrigger>
          <TabsTrigger value="stocks">Stocks ({stocks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="etfs" className="space-y-4">
          {etfs.map((option) => (
            <InvestmentCard
              key={option.id}
              option={option}
              amount={selectedAmounts[option.id] || 1000}
              onAmountChange={(amount) => handleAmountChange(option.id, amount)}
              onAddToPortfolio={() => handleAddToPortfolio(option)}
              getRiskColor={getRiskColor}
              getRiskLabel={getRiskLabel}
              getPerformanceColor={getPerformanceColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="bonds" className="space-y-4">
          {bonds.map((option) => (
            <InvestmentCard
              key={option.id}
              option={option}
              amount={selectedAmounts[option.id] || 1000}
              onAmountChange={(amount) => handleAmountChange(option.id, amount)}
              onAddToPortfolio={() => handleAddToPortfolio(option)}
              getRiskColor={getRiskColor}
              getRiskLabel={getRiskLabel}
              getPerformanceColor={getPerformanceColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="stocks" className="space-y-4">
          {stocks.length > 0 ? (
            stocks.map((option) => (
              <InvestmentCard
                key={option.id}
                option={option}
                amount={selectedAmounts[option.id] || 1000}
                onAmountChange={(amount) => handleAmountChange(option.id, amount)}
                onAddToPortfolio={() => handleAddToPortfolio(option)}
                getRiskColor={getRiskColor}
                getRiskLabel={getRiskLabel}
                getPerformanceColor={getPerformanceColor}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center p-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Individual Stocks Available</h3>
                <p className="text-muted-foreground">
                  Consider our diversified ETF options for broad market exposure.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InvestmentCardProps {
  option: InvestmentOption;
  amount: number;
  onAmountChange: (amount: number) => void;
  onAddToPortfolio: () => void;
  getRiskColor: (level: number) => string;
  getRiskLabel: (level: number) => string;
  getPerformanceColor: (performance: number) => string;
}

function InvestmentCard({
  option,
  amount,
  onAmountChange,
  onAddToPortfolio,
  getRiskColor,
  getRiskLabel,
  getPerformanceColor
}: InvestmentCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold">{option.symbol}</h3>
              <Badge variant="outline">{option.type.toUpperCase()}</Badge>
              <Badge className={`${getRiskColor(option.risk_level)} border-0`}>
                {getRiskLabel(option.risk_level)} Risk
              </Badge>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{option.region}</span>
              </div>
            </div>
            
            <h4 className="font-medium text-muted-foreground mb-2">{option.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Expense Ratio</p>
                <p className="font-medium">{(option.expense_ratio * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">1Y Return</p>
                <p className={`font-medium ${getPerformanceColor(option.performance_1y)}`}>
                  {option.performance_1y > 0 ? '+' : ''}{option.performance_1y}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">3Y Return</p>
                <p className={`font-medium ${getPerformanceColor(option.performance_3y)}`}>
                  {option.performance_3y > 0 ? '+' : ''}{option.performance_3y}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">5Y Return</p>
                <p className={`font-medium ${getPerformanceColor(option.performance_5y)}`}>
                  {option.performance_5y > 0 ? '+' : ''}{option.performance_5y}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col space-y-2">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => onAmountChange(Number(e.target.value) || 0)}
                className="w-32"
                min="0"
                step="100"
              />
              <CreditGuard
                operation={getCreditOperation('AI_INVESTMENT_ADVICE')}
                onProceed={onAddToPortfolio}
              >
                <Button 
                  className="w-32"
                  disabled={amount <= 0}
                >
                  Add to Portfolio
                </Button>
              </CreditGuard>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}