import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface Beneficiary {
  id?: string;
  full_name: string;
  relationship: string;
  date_of_birth: Date | null;
  contact_email: string;
  percentage: number;
  is_primary: boolean;
}

interface BeneficiaryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary?: Beneficiary | null;
  onSubmit: (beneficiary: Omit<Beneficiary, 'id'>) => void;
  existingPercentages: number;
  loading?: boolean;
}

const RELATIONSHIP_OPTIONS = [
  'spouse',
  'child',
  'parent',
  'sibling',
  'grandchild',
  'grandparent',
  'other_family',
  'friend',
  'charity',
  'other'
];

export default function BeneficiaryForm({ 
  open, 
  onOpenChange, 
  beneficiary, 
  onSubmit, 
  existingPercentages,
  loading = false 
}: BeneficiaryFormProps) {
  const [formData, setFormData] = useState<Omit<Beneficiary, 'id'>>({
    full_name: beneficiary?.full_name || '',
    relationship: beneficiary?.relationship || '',
    date_of_birth: beneficiary?.date_of_birth || null,
    contact_email: beneficiary?.contact_email || '',
    percentage: beneficiary?.percentage || 0,
    is_primary: beneficiary?.is_primary || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    if (formData.percentage <= 0) {
      newErrors.percentage = 'Percentage must be greater than 0';
    } else if (formData.percentage > 100) {
      newErrors.percentage = 'Percentage cannot exceed 100%';
    } else {
      const currentBeneficiaryPercentage = beneficiary?.percentage || 0;
      const totalPercentage = existingPercentages - currentBeneficiaryPercentage + formData.percentage;
      if (totalPercentage > 100) {
        newErrors.percentage = `Total percentage would exceed 100% (currently ${existingPercentages - currentBeneficiaryPercentage}%)`;
      }
    }

    if (formData.date_of_birth && formData.date_of_birth > new Date()) {
      newErrors.date_of_birth = 'Date of birth cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      relationship: '',
      date_of_birth: null,
      contact_email: '',
      percentage: 0,
      is_primary: false
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const remainingPercentage = 100 - existingPercentages + (beneficiary?.percentage || 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {beneficiary ? 'Edit Beneficiary' : 'Add Beneficiary'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select 
              value={formData.relationship} 
              onValueChange={(value) => setFormData({ ...formData, relationship: value })}
            >
              <SelectTrigger className={errors.relationship ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-sm text-destructive">{errors.relationship}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date_of_birth && "text-muted-foreground",
                    errors.date_of_birth && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_of_birth ? format(formData.date_of_birth, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date_of_birth || undefined}
                  onSelect={(date) => setFormData({ ...formData, date_of_birth: date || null })}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.date_of_birth && (
              <p className="text-sm text-destructive">{errors.date_of_birth}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Email Address *</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className={errors.contact_email ? 'border-destructive' : ''}
            />
            {errors.contact_email && (
              <p className="text-sm text-destructive">{errors.contact_email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage">
              Percentage * 
              <span className="text-sm text-muted-foreground ml-2">
                (Available: {remainingPercentage}%)
              </span>
            </Label>
            <Input
              id="percentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
              className={errors.percentage ? 'border-destructive' : ''}
            />
            {errors.percentage && (
              <p className="text-sm text-destructive">{errors.percentage}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
            />
            <Label htmlFor="is_primary">Primary Beneficiary</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : beneficiary ? 'Update' : 'Add'} Beneficiary
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}