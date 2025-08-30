import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, PiggyBank } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface RetirementAccount {
  id: string;
  account_type: string;
  balance: number;
  contribution_amount?: number;
  contribution_frequency?: string;
  institution_name?: string;
}

interface RetirementTabProps {
  data: RetirementAccount[] | undefined;
  isLoading: boolean;
}

export default function RetirementTab({ data, isLoading }: RetirementTabProps) {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<RetirementAccount | null>(null);
  
  const [formData, setFormData] = useState({
    account_type: '',
    balance: '',
    contribution_amount: '',
    contribution_frequency: 'monthly',
    institution_name: '',
  });

  const accountTypes = [
    '401k',
    '403b',
    'roth_ira',
    'traditional_ira',
    'sep_ira',
    'simple_ira',
    'pension',
    'other'
  ];

  const addAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('retirement_savings')
        .insert([{ ...data, user_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retirement-savings'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('retirement_savings')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retirement-savings'] });
      setEditingAccount(null);
      resetForm();
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('retirement_savings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retirement-savings'] });
    },
  });

  const resetForm = () => {
    setFormData({
      account_type: '',
      balance: '',
      contribution_amount: '',
      contribution_frequency: 'monthly',
      institution_name: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      account_type: formData.account_type,
      balance: parseFloat(formData.balance),
      contribution_amount: formData.contribution_amount ? parseFloat(formData.contribution_amount) : null,
      contribution_frequency: formData.contribution_frequency || null,
      institution_name: formData.institution_name || null,
    };

    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data: submitData });
    } else {
      addAccountMutation.mutate(submitData);
    }
  };

  const startEdit = (account: RetirementAccount) => {
    setEditingAccount(account);
    setFormData({
      account_type: account.account_type,
      balance: account.balance.toString(),
      contribution_amount: account.contribution_amount?.toString() || '',
      contribution_frequency: account.contribution_frequency || 'monthly',
      institution_name: account.institution_name || '',
    });
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      '401k': '401(k)',
      '403b': '403(b)',
      'roth_ira': 'Roth IRA',
      'traditional_ira': 'Traditional IRA',
      'sep_ira': 'SEP IRA',
      'simple_ira': 'SIMPLE IRA',
      'pension': 'Pension',
      'other': 'Other',
    };
    return labels[type] || type;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually',
    };
    return labels[frequency] || frequency;
  };

  const calculateAnnualContribution = (amount: number, frequency: string) => {
    const multipliers: { [key: string]: number } = {
      weekly: 52,
      biweekly: 26,
      monthly: 12,
      quarterly: 4,
      annually: 1,
    };
    return amount * (multipliers[frequency] || 12);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Retirement Accounts</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAccount(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Retirement Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Retirement Account' : 'Add Retirement Account'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="account_type">Account Type</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) => setFormData({ ...formData, account_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getAccountTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="balance">Current Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contribution_amount">Contribution Amount (Optional)</Label>
                  <Input
                    id="contribution_amount"
                    type="number"
                    step="0.01"
                    value={formData.contribution_amount}
                    onChange={(e) => setFormData({ ...formData, contribution_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="contribution_frequency">Frequency</Label>
                  <Select
                    value={formData.contribution_frequency}
                    onValueChange={(value) => setFormData({ ...formData, contribution_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="institution_name">Institution Name (Optional)</Label>
                <Input
                  id="institution_name"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  placeholder="e.g., Fidelity, Vanguard, Charles Schwab"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingAccount(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addAccountMutation.isPending || updateAccountMutation.isPending}>
                  {editingAccount ? 'Update' : 'Add'} Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {data?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No retirement accounts added yet. Add your 401(k), IRA, or other retirement savings accounts.
              </p>
            </CardContent>
          </Card>
        ) : (
          data?.map((account) => (
            <Card key={account.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h4 className="font-medium">{getAccountTypeLabel(account.account_type)}</h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatAmount(account.balance)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {account.institution_name && (
                      <Badge variant="secondary">{account.institution_name}</Badge>
                    )}
                    {account.contribution_amount && account.contribution_frequency && (
                      <Badge variant="outline">
                        {formatAmount(account.contribution_amount)} {getFrequencyLabel(account.contribution_frequency)}
                      </Badge>
                    )}
                    {account.contribution_amount && account.contribution_frequency && (
                      <Badge variant="outline">
                        {formatAmount(calculateAnnualContribution(account.contribution_amount, account.contribution_frequency))}/year
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      startEdit(account);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAccountMutation.mutate(account.id)}
                    disabled={deleteAccountMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}