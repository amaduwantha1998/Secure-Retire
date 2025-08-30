import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, DollarSign, Building, CreditCard, PiggyBank, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegistrationStore } from '@/stores/registrationStore';

export default function FinancialDetails() {
  const { 
    data, 
    addIncomeSource, 
    addAsset, 
    addDebt, 
    addRetirementSaving,
    updateIncomeSource,
    updateAsset,
    updateDebt,
    updateRetirementSaving,
    removeIncomeSource,
    removeAsset,
    removeDebt,
    removeRetirementSaving
  } = useRegistrationStore();
  
  const [activeTab, setActiveTab] = useState('income');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  // Debounced update function to avoid too frequent updates
  const debouncedUpdate = useCallback((fn: () => void) => {
    setSaving(true);
    const timeoutId = setTimeout(() => {
      fn();
      setSaving(false);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const incomeSourceTypes = [
    'Salary/Wages',
    'Self-Employment',
    'Rental Income',
    'Investment Income',
    'Pension',
    'Social Security',
    'Other',
  ];

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
  ];

  const assetTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'investment', label: 'Investment Account' },
    { value: 'retirement', label: 'Retirement Account' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'other', label: 'Other' },
  ];

  const debtTypes = [
    { value: 'mortgage', label: 'Mortgage' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'auto_loan', label: 'Auto Loan' },
    { value: 'student_loan', label: 'Student Loan' },
    { value: 'personal_loan', label: 'Personal Loan' },
    { value: 'other', label: 'Other' },
  ];

  const retirementAccountTypes = [
    { value: '401k', label: '401(k)' },
    { value: '403b', label: '403(b)' },
    { value: 'ira', label: 'Traditional IRA' },
    { value: 'roth_ira', label: 'Roth IRA' },
    { value: 'pension', label: 'Pension' },
    { value: 'sep_ira', label: 'SEP IRA' },
    { value: 'simple_ira', label: 'SIMPLE IRA' },
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];

  const addNewIncomeSource = () => {
    addIncomeSource({
      id: crypto.randomUUID(),
      sourceType: '',
      amount: 0,
      currency: 'USD',
      frequency: 'monthly',
    });
  };

  const addNewAsset = () => {
    addAsset({
      id: crypto.randomUUID(),
      type: 'checking',
      institutionName: '',
      amount: 0,
      currency: 'USD',
    });
  };

  const addNewDebt = () => {
    addDebt({
      id: crypto.randomUUID(),
      debtType: 'credit_card',
      balance: 0,
      interestRate: 0,
      monthlyPayment: 0,
    });
  };

  const addNewRetirementSaving = () => {
    addRetirementSaving({
      id: crypto.randomUUID(),
      accountType: '401k',
      institutionName: '',
      balance: 0,
      contributionAmount: 0,
      contributionFrequency: 'monthly',
    });
  };

  const validateFinancialData = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate income sources
    data.financialDetails.incomeSources.forEach((income, index) => {
      if (income.amount < 0) {
        newErrors[`income-${index}-amount`] = 'Amount must be positive';
      }
      if (!income.sourceType) {
        newErrors[`income-${index}-type`] = 'Source type is required';
      }
    });

    // Validate assets
    data.financialDetails.assets.forEach((asset, index) => {
      if (asset.amount < 0) {
        newErrors[`asset-${index}-amount`] = 'Amount must be positive';
      }
      if (!asset.institutionName) {
        newErrors[`asset-${index}-institution`] = 'Institution name is required';
      }
    });

    // Validate debts
    data.financialDetails.debts.forEach((debt, index) => {
      if (debt.balance < 0) {
        newErrors[`debt-${index}-balance`] = 'Balance must be positive';
      }
      if (debt.interestRate < 0 || debt.interestRate > 100) {
        newErrors[`debt-${index}-rate`] = 'Interest rate must be between 0 and 100';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Add your financial information to get personalized retirement planning advice
        </p>
        {saving && (
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving changes...
          </div>
        )}
      </div>

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Please fix the errors below before proceeding.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="income" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Income
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="debts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Debts
          </TabsTrigger>
          <TabsTrigger value="retirement" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            Retirement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Income Sources</h3>
            <Button onClick={addNewIncomeSource} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Income Source
            </Button>
          </div>

          {data.financialDetails.incomeSources.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No income sources added yet</p>
                <Button onClick={addNewIncomeSource} variant="outline" className="mt-4">
                  Add Your First Income Source
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.financialDetails.incomeSources.map((income, index) => (
                <Card key={income.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium">Source Type</label>
                        <Select 
                          value={income.sourceType} 
                          onValueChange={(value) => updateIncomeSource(income.id, { sourceType: value })}
                        >
                          <SelectTrigger className={errors[`income-${index}-type`] ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            {incomeSourceTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`income-${index}-type`] && (
                          <p className="text-sm text-destructive mt-1">{errors[`income-${index}-type`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={income.amount}
                          onChange={(e) => updateIncomeSource(income.id, { amount: Number(e.target.value) })}
                          className={errors[`income-${index}-amount`] ? 'border-destructive' : ''}
                        />
                        {errors[`income-${index}-amount`] && (
                          <p className="text-sm text-destructive mt-1">{errors[`income-${index}-amount`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Frequency</label>
                        <Select 
                          value={income.frequency} 
                          onValueChange={(value) => updateIncomeSource(income.id, { frequency: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            {frequencies.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeIncomeSource(income.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assets</h3>
            <Button onClick={addNewAsset} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>

          {data.financialDetails.assets.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No assets added yet</p>
                <Button onClick={addNewAsset} variant="outline" className="mt-4">
                  Add Your First Asset
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.financialDetails.assets.map((asset, index) => (
                <Card key={asset.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium">Asset Type</label>
                        <Select 
                          value={asset.type} 
                          onValueChange={(value) => updateAsset(asset.id, { type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            {assetTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Institution</label>
                        <Input
                          placeholder="Bank/Institution name"
                          value={asset.institutionName}
                          onChange={(e) => updateAsset(asset.id, { institutionName: e.target.value })}
                          className={errors[`asset-${index}-institution`] ? 'border-destructive' : ''}
                        />
                        {errors[`asset-${index}-institution`] && (
                          <p className="text-sm text-destructive mt-1">{errors[`asset-${index}-institution`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={asset.amount}
                          onChange={(e) => updateAsset(asset.id, { amount: Number(e.target.value) })}
                          className={errors[`asset-${index}-amount`] ? 'border-destructive' : ''}
                        />
                        {errors[`asset-${index}-amount`] && (
                          <p className="text-sm text-destructive mt-1">{errors[`asset-${index}-amount`]}</p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeAsset(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="debts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Debts</h3>
            <Button onClick={addNewDebt} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Debt
            </Button>
          </div>

          {data.financialDetails.debts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No debts added yet</p>
                <Button onClick={addNewDebt} variant="outline" className="mt-4">
                  Add Debt Information
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.financialDetails.debts.map((debt, index) => (
                <Card key={debt.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium">Debt Type</label>
                        <Select 
                          value={debt.debtType} 
                          onValueChange={(value) => updateDebt(debt.id, { debtType: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            {debtTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Balance</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={debt.balance}
                          onChange={(e) => updateDebt(debt.id, { balance: Number(e.target.value) })}
                          className={errors[`debt-${index}-balance`] ? 'border-destructive' : ''}
                        />
                        {errors[`debt-${index}-balance`] && (
                          <p className="text-sm text-destructive mt-1">{errors[`debt-${index}-balance`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Interest Rate (%)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={debt.interestRate}
                          onChange={(e) => updateDebt(debt.id, { interestRate: Number(e.target.value) })}
                          className={errors[`debt-${index}-rate`] ? 'border-destructive' : ''}
                        />
                        {errors[`debt-${index}-rate`] && (
                          <p className="text-sm text-destructive mt-1">{errors[`debt-${index}-rate`]}</p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeDebt(debt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="retirement" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Retirement Savings</h3>
            <Button onClick={addNewRetirementSaving} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Retirement Account
            </Button>
          </div>

          {data.financialDetails.retirementSavings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No retirement accounts added yet</p>
                <Button onClick={addNewRetirementSaving} variant="outline" className="mt-4">
                  Add Retirement Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.financialDetails.retirementSavings.map((saving, index) => (
                <Card key={saving.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium">Account Type</label>
                        <Select 
                          value={saving.accountType} 
                          onValueChange={(value) => updateRetirementSaving(saving.id, { accountType: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            {retirementAccountTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Institution</label>
                        <Input
                          placeholder="Institution name"
                          value={saving.institutionName}
                          onChange={(e) => updateRetirementSaving(saving.id, { institutionName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Balance</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={saving.balance}
                          onChange={(e) => updateRetirementSaving(saving.id, { balance: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeRetirementSaving(saving.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-6">
        <Button onClick={validateFinancialData} variant="outline">
          Validate Financial Data
        </Button>
      </div>
    </div>
  );
}