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
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Debt {
  id: string;
  debt_type: string;
  balance: number;
  interest_rate?: number;
  monthly_payment?: number;
  due_date?: string;
}

interface DebtsTabProps {
  data: Debt[] | undefined;
  isLoading: boolean;
}

export default function DebtsTab({ data, isLoading }: DebtsTabProps) {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  
  const [formData, setFormData] = useState({
    debt_type: '',
    balance: '',
    interest_rate: '',
    monthly_payment: '',
    due_date: '',
  });

  const debtTypes = [
    'credit_card',
    'student_loan',
    'mortgage',
    'auto_loan',
    'personal_loan',
    'medical_debt',
    'other'
  ];

  const addDebtMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('debts')
        .insert([{ ...data, user_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateDebtMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('debts')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      setEditingDebt(null);
      resetForm();
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const resetForm = () => {
    setFormData({
      debt_type: '',
      balance: '',
      interest_rate: '',
      monthly_payment: '',
      due_date: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      debt_type: formData.debt_type,
      balance: parseFloat(formData.balance),
      interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
      monthly_payment: formData.monthly_payment ? parseFloat(formData.monthly_payment) : null,
      due_date: formData.due_date || null,
    };

    if (editingDebt) {
      updateDebtMutation.mutate({ id: editingDebt.id, data: submitData });
    } else {
      addDebtMutation.mutate(submitData);
    }
  };

  const startEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      debt_type: debt.debt_type,
      balance: debt.balance.toString(),
      interest_rate: debt.interest_rate?.toString() || '',
      monthly_payment: debt.monthly_payment?.toString() || '',
      due_date: debt.due_date || '',
    });
  };

  const getDebtTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      credit_card: 'Credit Card',
      student_loan: 'Student Loan',
      mortgage: 'Mortgage',
      auto_loan: 'Auto Loan',
      personal_loan: 'Personal Loan',
      medical_debt: 'Medical Debt',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getInterestRateColor = (rate?: number) => {
    if (!rate) return 'text-muted-foreground';
    if (rate > 20) return 'text-red-600';
    if (rate > 10) return 'text-yellow-600';
    return 'text-green-600';
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
        <h3 className="text-lg font-semibold">Debts & Liabilities</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDebt(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDebt ? 'Edit Debt' : 'Add Debt'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="debt_type">Debt Type</Label>
                <Select
                  value={formData.debt_type}
                  onValueChange={(value) => setFormData({ ...formData, debt_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select debt type" />
                  </SelectTrigger>
                  <SelectContent>
                    {debtTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getDebtTypeLabel(type)}
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
                  <Label htmlFor="interest_rate">Interest Rate (%) (Optional)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_payment">Monthly Payment (Optional)</Label>
                  <Input
                    id="monthly_payment"
                    type="number"
                    step="0.01"
                    value={formData.monthly_payment}
                    onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="due_date">Next Due Date (Optional)</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingDebt(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addDebtMutation.isPending || updateDebtMutation.isPending}>
                  {editingDebt ? 'Update' : 'Add'} Debt
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
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No debts recorded. Add any outstanding loans or credit card balances to track your liabilities.
              </p>
            </CardContent>
          </Card>
        ) : (
          data?.map((debt) => (
            <Card key={debt.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h4 className="font-medium">{getDebtTypeLabel(debt.debt_type)}</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatAmount(debt.balance)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {debt.interest_rate && (
                      <Badge variant="outline" className={getInterestRateColor(debt.interest_rate)}>
                        {debt.interest_rate}% APR
                      </Badge>
                    )}
                    {debt.monthly_payment && (
                      <Badge variant="secondary">
                        {formatAmount(debt.monthly_payment)}/mo
                      </Badge>
                    )}
                    {debt.due_date && (
                      <Badge variant="outline">
                        Due {new Date(debt.due_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      startEdit(debt);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteDebtMutation.mutate(debt.id)}
                    disabled={deleteDebtMutation.isPending}
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