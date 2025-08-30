import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar, CalendarIcon, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
import { CountrySelect } from '@/components/ui/country-select';
import { cn } from '@/lib/utils';
import { useRegistrationStore, PersonalInfo as PersonalInfoType } from '@/stores/registrationStore';
import { useAuth } from '@/contexts/AuthContext';

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  ssn: z.string().min(9, 'Please enter a valid SSN/National ID'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Province is required'),
    zipCode: z.string().min(5, 'ZIP/Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

const countries = [
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR' },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'TH', name: 'Thailand', currency: 'THB' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR' },
  { code: 'PH', name: 'Philippines', currency: 'PHP' },
  { code: 'VN', name: 'Vietnam', currency: 'VND' },
];

export default function PersonalInfo() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, updatePersonalInfo } = useRegistrationStore();

  const form = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: data.personalInfo.fullName || user?.user_metadata?.full_name || '',
      dateOfBirth: data.personalInfo.dateOfBirth || undefined,
      ssn: data.personalInfo.ssn || '',
      phone: data.personalInfo.phone || user?.user_metadata?.phone || '',
      address: {
        street: data.personalInfo.address.street || '',
        city: data.personalInfo.address.city || '',
        state: data.personalInfo.address.state || '',
        zipCode: data.personalInfo.address.zipCode || '',
        country: data.personalInfo.address.country || 'LK',
      },
    },
  });

  // Auto-populate form with user data on first load
  React.useEffect(() => {
    if (user?.user_metadata && !data.personalInfo.fullName) {
      const userData = {
        fullName: user.user_metadata.full_name || '',
        phone: user.user_metadata.phone || '',
      };
      
      if (userData.fullName) {
        form.setValue('fullName', userData.fullName);
      }
      if (userData.phone) {
        form.setValue('phone', userData.phone);
      }
    }
  }, [user, form, data.personalInfo.fullName]);

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Auto-save form data
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      updatePersonalInfo(values as PersonalInfoType);
    });
    return () => subscription.unsubscribe();
  }, [form, updatePersonalInfo]);

  const validateSSN = (ssn: string, country: string) => {
    // Remove all non-numeric characters
    const cleaned = ssn.replace(/\D/g, '');
    
    switch (country) {
      case 'US':
        // US SSN format: XXX-XX-XXXX (9 digits)
        return cleaned.length === 9;
      case 'CA':
        // Canadian SIN format: XXX-XXX-XXX (9 digits)
        return cleaned.length === 9;
      case 'GB':
        // UK National Insurance number: 2 letters + 6 digits + 1 letter
        return /^[A-Z]{2}[0-9]{6}[A-Z]$/.test(ssn.toUpperCase());
      case 'LK':
        // Sri Lankan NIC: 9 digits + V/X or 12 digits
        return /^([0-9]{9}[VX]|[0-9]{12})$/.test(ssn.toUpperCase());
      default:
        return cleaned.length >= 8; // Generic validation
    }
  };

  const formatSSN = (value: string, country: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    switch (country) {
      case 'US':
        if (cleaned.length >= 9) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
        } else if (cleaned.length >= 5) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
        } else if (cleaned.length >= 3) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        }
        return cleaned;
      case 'CA':
        if (cleaned.length >= 9) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}`;
        } else if (cleaned.length >= 6) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length >= 3) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        }
        return cleaned;
      default:
        return cleaned;
    }
  };

  const getSSNLabel = (country: string) => {
    switch (country) {
      case 'US':
        return 'Social Security Number (SSN)';
      case 'CA':
        return 'Social Insurance Number (SIN)';
      case 'GB':
        return 'National Insurance Number';
      case 'LK':
        return 'National Identity Card (NIC)';
      default:
        return 'National ID Number';
    }
  };

  const getSSNPlaceholder = (country: string) => {
    switch (country) {
      case 'US':
        return '123-45-6789';
      case 'CA':
        return '123-456-789';
      case 'GB':
        return 'AB123456C';
      case 'LK':
        return '200012345678 or 123456789V';
      default:
        return 'Enter your national ID';
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Full Legal Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your full name as it appears on legal documents
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
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
                    <CalendarComponent
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.country"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <CountrySelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select your country"
                    className="backdrop-blur-md bg-background/30 border-border/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ssn"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{getSSNLabel(watchedValues.address?.country || 'US')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={getSSNPlaceholder(watchedValues.address?.country || 'US')}
                    {...field}
                    onChange={(e) => {
                      const formatted = formatSSN(e.target.value, watchedValues.address?.country || 'US');
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  This information is encrypted and used for tax and identity verification
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="123 Main Street" {...field} />
                    <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormDescription>
                  Google Maps autocomplete will be integrated for address verification
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP/Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="10001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}