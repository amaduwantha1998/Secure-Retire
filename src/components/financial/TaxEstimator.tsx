import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, FileText, DollarSign, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TaxEstimatorProps {
  annualIncome: number;
  deductions: number;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface TaxCalculation {
  grossIncome: number;
  adjustedGrossIncome: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  marginalRate: number;
}

export default function TaxEstimator({ annualIncome, deductions }: TaxEstimatorProps) {
  const [filingStatus, setFilingStatus] = useState('single');
  const [state, setState] = useState('CA');
  const [customIncome, setCustomIncome] = useState(annualIncome.toString());
  const [customDeductions, setCustomDeductions] = useState(deductions.toString());
  const [additionalDeductions, setAdditionalDeductions] = useState('0');
  
  // 2024 Federal Tax Brackets
  const federalBrackets: { [key: string]: TaxBracket[] } = {
    single: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Infinity, rate: 0.37 },
    ],
    marriedJoint: [
      { min: 0, max: 22000, rate: 0.10 },
      { min: 22000, max: 89450, rate: 0.12 },
      { min: 89450, max: 190750, rate: 0.22 },
      { min: 190750, max: 364200, rate: 0.24 },
      { min: 364200, max: 462500, rate: 0.32 },
      { min: 462500, max: 693750, rate: 0.35 },
      { min: 693750, max: Infinity, rate: 0.37 },
    ],
  };

  // Standard deductions for 2024
  const standardDeductions: { [key: string]: number } = {
    single: 13850,
    marriedJoint: 27700,
    marriedSeparate: 13850,
    headOfHousehold: 20800,
  };

  // State tax rates (simplified)
  const stateTaxRates: { [key: string]: number } = {
    CA: 0.093, // California average
    NY: 0.082, // New York average
    TX: 0, // No state income tax
    FL: 0, // No state income tax
    WA: 0, // No state income tax
    OR: 0.099, // Oregon average
    IL: 0.0495, // Illinois flat rate
  };

  const calculateTax = (): TaxCalculation => {
    const income = parseFloat(customIncome) || 0;
    const retirementDeductions = parseFloat(customDeductions) || 0;
    const otherDeductions = parseFloat(additionalDeductions) || 0;
    
    // Calculate AGI (subtract pre-tax deductions like 401k)
    const adjustedGrossIncome = income - retirementDeductions;
    
    // Calculate taxable income (subtract standard deduction and other deductions)
    const standardDeduction = standardDeductions[filingStatus] || standardDeductions.single;
    const totalDeductions = Math.max(standardDeduction, otherDeductions);
    const taxableIncome = Math.max(0, adjustedGrossIncome - totalDeductions);
    
    // Calculate federal tax
    const brackets = federalBrackets[filingStatus] || federalBrackets.single;
    let federalTax = 0;
    let marginalRate = 0;
    
    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableAtThisBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
        federalTax += taxableAtThisBracket * bracket.rate;
        marginalRate = bracket.rate;
      }
    }
    
    // Calculate state tax (simplified)
    const stateTax = adjustedGrossIncome * (stateTaxRates[state] || 0);
    
    // Calculate FICA taxes (Social Security + Medicare)
    const socialSecurityTax = Math.min(income, 160200) * 0.062; // 2024 SS wage base
    const medicareTax = income * 0.0145;
    const additionalMedicareTax = Math.max(0, income - (filingStatus === 'marriedJoint' ? 250000 : 200000)) * 0.009;
    const ficaTax = socialSecurityTax + medicareTax + additionalMedicareTax;
    
    const totalTax = federalTax + stateTax + ficaTax;
    const netIncome = income - totalTax;
    const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
    
    return {
      grossIncome: income,
      adjustedGrossIncome,
      taxableIncome,
      federalTax,
      stateTax,
      ficaTax,
      totalTax,
      netIncome,
      effectiveRate,
      marginalRate: marginalRate * 100,
    };
  };

  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation>(calculateTax());

  useEffect(() => {
    setTaxCalculation(calculateTax());
  }, [customIncome, customDeductions, additionalDeductions, filingStatus, state]);

  const taxStrategies = [
    {
      title: "Maximize Retirement Contributions",
      description: "Contribute the maximum to your 401(k) and IRA to reduce taxable income.",
      potential: formatCurrency((22500 - parseFloat(customDeductions)) * (taxCalculation.marginalRate / 100)),
    },
    {
      title: "Health Savings Account",
      description: "Contribute to an HSA for triple tax benefits if you have a high-deductible health plan.",
      potential: formatCurrency(3650 * (taxCalculation.marginalRate / 100)),
    },
    {
      title: "Tax-Loss Harvesting",
      description: "Offset capital gains with investment losses to reduce your tax liability.",
      potential: "Varies",
    },
    {
      title: "Charitable Giving",
      description: "Make charitable donations to reduce taxable income while supporting causes you care about.",
      potential: "Up to 60% of AGI",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(taxCalculation.grossIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(taxCalculation.totalTax)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(taxCalculation.netIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effective Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxCalculation.effectiveRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
          <TabsTrigger value="breakdown">Tax Breakdown</TabsTrigger>
          <TabsTrigger value="strategies">Tax Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tax Calculator Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="annual-income">Annual Income</Label>
                  <Input
                    id="annual-income"
                    type="number"
                    value={customIncome}
                    onChange={(e) => setCustomIncome(e.target.value)}
                    placeholder="Annual gross income"
                  />
                </div>
                <div>
                  <Label htmlFor="retirement-contributions">Retirement Contributions</Label>
                  <Input
                    id="retirement-contributions"
                    type="number"
                    value={customDeductions}
                    onChange={(e) => setCustomDeductions(e.target.value)}
                    placeholder="401k, IRA contributions"
                  />
                </div>
                <div>
                  <Label htmlFor="filing-status">Filing Status</Label>
                  <Select value={filingStatus} onValueChange={setFilingStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="marriedJoint">Married Filing Jointly</SelectItem>
                      <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
                      <SelectItem value="headOfHousehold">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="WA">Washington</SelectItem>
                      <SelectItem value="OR">Oregon</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="additional-deductions">Additional Deductions (Optional)</Label>
                  <Input
                    id="additional-deductions"
                    type="number"
                    value={additionalDeductions}
                    onChange={(e) => setAdditionalDeductions(e.target.value)}
                    placeholder="Mortgage interest, charitable giving, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Tax Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Gross Income:</span>
                  <span className="font-medium">{formatCurrency(taxCalculation.grossIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pre-tax Deductions:</span>
                  <span className="font-medium">-{formatCurrency(parseFloat(customDeductions))}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Adjusted Gross Income (AGI):</span>
                  <span className="font-medium">{formatCurrency(taxCalculation.adjustedGrossIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Deduction:</span>
                  <span className="font-medium">-{formatCurrency(standardDeductions[filingStatus])}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Taxable Income:</span>
                  <span className="font-medium">{formatCurrency(taxCalculation.taxableIncome)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Federal Income Tax:</span>
                  <span className="font-medium text-red-600">{formatCurrency(taxCalculation.federalTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>State Income Tax ({state}):</span>
                  <span className="font-medium text-red-600">{formatCurrency(taxCalculation.stateTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>FICA Taxes (SS + Medicare):</span>
                  <span className="font-medium text-red-600">{formatCurrency(taxCalculation.ficaTax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Tax:</span>
                  <span className="text-red-600">{formatCurrency(taxCalculation.totalTax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Income:</span>
                  <span className="text-green-600">{formatCurrency(taxCalculation.netIncome)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
                  <p className="text-2xl font-bold">{taxCalculation.effectiveRate.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Marginal Tax Rate</p>
                  <p className="text-2xl font-bold">{taxCalculation.marginalRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4">
            {taxStrategies.map((strategy, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{strategy.title}</h4>
                      <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      Save {strategy.potential}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Important Tax Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tax Filing Deadline:</span>
                  <Badge>April 15, 2025</Badge>
                </div>
                <div className="flex justify-between">
                  <span>IRA Contribution Deadline:</span>
                  <Badge>April 15, 2025</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Q1 Estimated Tax Payment:</span>
                  <Badge>January 15, 2025</Badge>
                </div>
                <div className="flex justify-between">
                  <span>401(k) Contribution Deadline:</span>
                  <Badge>December 31, 2024</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}