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
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface IncomeSource {
  id: string;
  source_type: string;
  amount: number;
  frequency: string;
  currency: string;
  start_date?: string;
  end_date?: string;
}

interface IncomeTabProps {
  data: IncomeSource[] | undefined;
  isLoading: boolean;
}

export default function IncomeTab({ data, isLoading }: IncomeTabProps) {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);
  
  const [formData, setFormData] = useState({
    source_type: '',
    amount: '',
    frequency: 'monthly',
    currency: 'USD',
    start_date: '',
    end_date: '',
  });

  const addIncomeMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('income_sources')
        .insert([{ ...data, user_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('income_sources')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      setEditingIncome(null);
      resetForm();
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] });
    },
  });

  const resetForm = () => {
    setFormData({
      source_type: '',
      amount: '',
      frequency: 'monthly',
      currency: 'USD',
      start_date: '',
      end_date: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingIncome) {
      updateIncomeMutation.mutate({ id: editingIncome.id, data: submitData });
    } else {
      addIncomeMutation.mutate(submitData);
    }
  };

  const startEdit = (income: IncomeSource) => {
    setEditingIncome(income);
    setFormData({
      source_type: income.source_type,
      amount: income.amount.toString(),
      frequency: income.frequency,
      currency: income.currency,
      start_date: income.start_date || '',
      end_date: income.end_date || '',
    });
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
        <h3 className="text-lg font-semibold">Income Sources</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingIncome(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Income Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? 'Edit Income Source' : 'Add Income Source'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="source_type">Income Type</Label>
                <Input
                  id="source_type"
                  value={formData.source_type}
                  onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                  placeholder="e.g., Salary, Freelance, Investment"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date (Optional)</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingIncome(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addIncomeMutation.isPending || updateIncomeMutation.isPending}>
                  {editingIncome ? 'Update' : 'Add'} Income
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
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No income sources added yet. Start by adding your primary income source.
              </p>
            </CardContent>
          </Card>
        ) : (
          data?.map((income) => (
            <Card key={income.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h4 className="font-medium">{income.source_type}</h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatAmount(income.amount, income.currency)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary">{getFrequencyLabel(income.frequency)}</Badge>
                    {income.end_date && (
                      <Badge variant="outline">
                        Ends {new Date(income.end_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      startEdit(income);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteIncomeMutation.mutate(income.id)}
                    disabled={deleteIncomeMutation.isPending}
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