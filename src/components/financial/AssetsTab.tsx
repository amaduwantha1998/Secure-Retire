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
import { Plus, Edit, Trash2, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Asset {
  id: string;
  type: string;
  amount: number;
  currency: string;
  institution_name?: string;
  account_number?: string;
}

interface AssetsTabProps {
  data: Asset[] | undefined;
  isLoading: boolean;
}

export default function AssetsTab({ data, isLoading }: AssetsTabProps) {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    currency: 'USD',
    institution_name: '',
    account_number: '',
  });

  const assetTypes = [
    'checking',
    'savings',
    'investment',
    'retirement',
    'real_estate',
    'vehicle',
    'cryptocurrency',
    'other'
  ];

  const addAssetMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('assets')
        .insert([{ ...data, user_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('assets')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setEditingAsset(null);
      resetForm();
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const resetForm = () => {
    setFormData({
      type: '',
      amount: '',
      currency: 'USD',
      institution_name: '',
      account_number: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      institution_name: formData.institution_name || null,
      account_number: formData.account_number || null,
    };

    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: submitData });
    } else {
      addAssetMutation.mutate(submitData);
    }
  };

  const startEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      type: asset.type,
      amount: asset.amount.toString(),
      currency: asset.currency,
      institution_name: asset.institution_name || '',
      account_number: asset.account_number || '',
    });
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      checking: 'Checking Account',
      savings: 'Savings Account',
      investment: 'Investment Account',
      retirement: 'Retirement Account',
      real_estate: 'Real Estate',
      vehicle: 'Vehicle',
      cryptocurrency: 'Cryptocurrency',
      other: 'Other',
    };
    return labels[type] || type;
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
        <h3 className="text-lg font-semibold">Assets</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAsset(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Edit Asset' : 'Add Asset'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Asset Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getAssetTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Current Value</Label>
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
                <Label htmlFor="institution_name">Institution Name (Optional)</Label>
                <Input
                  id="institution_name"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  placeholder="e.g., Chase Bank, Vanguard"
                />
              </div>
              <div>
                <Label htmlFor="account_number">Account Number (Optional)</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="Last 4 digits or identifier"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingAsset(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addAssetMutation.isPending || updateAssetMutation.isPending}>
                  {editingAsset ? 'Update' : 'Add'} Asset
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
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No assets added yet. Start by adding your checking or savings account.
              </p>
            </CardContent>
          </Card>
        ) : (
          data?.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h4 className="font-medium">{getAssetTypeLabel(asset.type)}</h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatAmount(asset.amount, asset.currency)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {asset.institution_name && (
                      <Badge variant="secondary">{asset.institution_name}</Badge>
                    )}
                    {asset.account_number && (
                      <Badge variant="outline">***{asset.account_number}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      startEdit(asset);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAssetMutation.mutate(asset.id)}
                    disabled={deleteAssetMutation.isPending}
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