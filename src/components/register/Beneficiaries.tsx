import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, Trash2, Calendar as CalendarIcon, Users } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useRegistrationStore, Beneficiary } from '@/stores/registrationStore';

const beneficiarySchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  relationship: z.enum(['spouse', 'child', 'parent', 'sibling', 'friend', 'other']),
  dateOfBirth: z.date().optional(),
  percentage: z.number().min(1).max(100),
  isPrimary: z.boolean(),
  contactEmail: z.string().email().optional().or(z.literal('')),
});

type BeneficiaryForm = z.infer<typeof beneficiarySchema>;

const relationships = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

export default function Beneficiaries() {
  const { data, addBeneficiary, updateBeneficiary, removeBeneficiary } = useRegistrationStore();
  
  const addNewBeneficiary = () => {
    const newBeneficiary: Beneficiary = {
      id: crypto.randomUUID(),
      fullName: '',
      relationship: 'spouse',
      dateOfBirth: null,
      percentage: 0,
      isPrimary: data.beneficiaries.length === 0, // First beneficiary is primary by default
      contactEmail: '',
    };
    addBeneficiary(newBeneficiary);
  };

  const totalPercentage = data.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  const primaryBeneficiaries = data.beneficiaries.filter(b => b.isPrimary);
  const contingentBeneficiaries = data.beneficiaries.filter(b => !b.isPrimary);

  const BeneficiaryCard = ({ beneficiary, index }: { beneficiary: Beneficiary; index: number }) => {
    const form = useForm<BeneficiaryForm>({
      resolver: zodResolver(beneficiarySchema),
      defaultValues: {
        fullName: beneficiary.fullName,
        relationship: beneficiary.relationship,
        dateOfBirth: beneficiary.dateOfBirth || undefined,
        percentage: beneficiary.percentage,
        isPrimary: beneficiary.isPrimary,
        contactEmail: beneficiary.contactEmail || '',
      },
    });

    const onSubmit = (values: BeneficiaryForm) => {
      updateBeneficiary(beneficiary.id, {
        ...values,
        dateOfBirth: values.dateOfBirth || null,
      });
    };

    // Auto-save on change
    React.useEffect(() => {
      const subscription = form.watch((values) => {
        if (values.fullName || values.percentage) {
          updateBeneficiary(beneficiary.id, {
            fullName: values.fullName || '',
            relationship: values.relationship || 'spouse',
            dateOfBirth: values.dateOfBirth || null,
            percentage: values.percentage || 0,
            isPrimary: values.isPrimary || false,
            contactEmail: values.contactEmail || '',
          });
        }
      });
      return () => subscription.unsubscribe();
    }, [form]);

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">
            {beneficiary.isPrimary ? 'Primary' : 'Contingent'} Beneficiary #{index + 1}
          </CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => removeBeneficiary(beneficiary.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border z-50">
                          {relationships.map((rel) => (
                            <SelectItem key={rel.value} value={rel.value}>
                              {rel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                            className={cn('p-3 pointer-events-auto')}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="50"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="beneficiary@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Primary Beneficiary</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Primary beneficiaries receive benefits first
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Users className="h-6 w-6" />
          Beneficiaries
        </h2>
        <p className="text-muted-foreground">
          Designate who will receive your assets. Primary beneficiaries receive benefits first,
          contingent beneficiaries receive benefits if primary beneficiaries are unavailable.
        </p>
      </div>

      {/* Summary */}
      {data.beneficiaries.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{primaryBeneficiaries.length}</div>
                <div className="text-sm text-muted-foreground">Primary Beneficiaries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{contingentBeneficiaries.length}</div>
                <div className="text-sm text-muted-foreground">Contingent Beneficiaries</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-success' : 'text-destructive'}`}>
                  {totalPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">Total Allocation</div>
              </div>
            </div>
            {totalPercentage !== 100 && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                <p className="text-sm text-destructive">
                  ⚠️ Total percentage should equal 100%. Current total: {totalPercentage}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Beneficiary Button */}
      <div className="flex justify-center">
        <Button onClick={addNewBeneficiary} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Beneficiary
        </Button>
      </div>

      {/* Beneficiaries List */}
      {data.beneficiaries.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Beneficiaries Added</h3>
            <p className="text-muted-foreground mb-4">
              Add beneficiaries to ensure your assets are distributed according to your wishes.
            </p>
            <Button onClick={addNewBeneficiary} variant="outline">
              Add Your First Beneficiary
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.beneficiaries.map((beneficiary, index) => (
            <BeneficiaryCard
              key={beneficiary.id}
              beneficiary={beneficiary}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Important Notes:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Primary beneficiaries receive benefits first</li>
          <li>• Contingent beneficiaries receive benefits if primary beneficiaries are unable to</li>
          <li>• Total percentages should equal 100%</li>
          <li>• You can have multiple primary and contingent beneficiaries</li>
          <li>• Keep beneficiary information updated as life circumstances change</li>
        </ul>
      </div>
    </div>
  );
}