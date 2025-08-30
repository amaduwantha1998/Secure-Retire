import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle, Edit, User, DollarSign, Users, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegistrationStore } from '@/stores/registrationStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Summary() {
  const navigate = useNavigate();
  const { data, completeRegistration } = useRegistrationStore();
  const [error, setError] = useState<string | null>(null);

  const submitRegistration = useMutation({
    mutationFn: async () => {
      console.log('Starting registration submission...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User authentication error:', userError);
        throw new Error('User not authenticated. Please sign in again.');
      }

      console.log('User authenticated:', user.id);

      try {
        // Save personal info to users table
        console.log('Updating user profile...');
        const { error: userUpdateError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email!,
            full_name: data.personalInfo.fullName,
            date_of_birth: data.personalInfo.dateOfBirth?.toISOString().split('T')[0] || null,
            ssn: data.personalInfo.ssn,
            address: data.personalInfo.address,
            phone: data.personalInfo.phone,
            country: data.personalInfo.address.country,
            currency: 'USD', // Default currency based on country
          });

        if (userUpdateError) {
          console.error('User profile update error:', userUpdateError);
          throw new Error(`Failed to update profile: ${userUpdateError.message}`);
        }
        console.log('User profile updated successfully');

        // Save income sources
        if (data.financialDetails.incomeSources.length > 0) {
          console.log('Saving income sources...');
          const { error: incomeError } = await supabase
            .from('income_sources')
            .insert(
              data.financialDetails.incomeSources.map(income => ({
                user_id: user.id,
                source_type: income.sourceType,
                amount: income.amount,
                currency: income.currency,
                frequency: income.frequency,
              }))
            );

          if (incomeError) {
            console.error('Income sources error:', incomeError);
            throw new Error(`Failed to save income sources: ${incomeError.message}`);
          }
          console.log('Income sources saved successfully');
        }

        // Save assets
        if (data.financialDetails.assets.length > 0) {
          console.log('Saving assets...');
          const { error: assetsError } = await supabase
            .from('assets')
            .insert(
              data.financialDetails.assets.map(asset => ({
                user_id: user.id,
                type: asset.type,
                institution_name: asset.institutionName,
                amount: asset.amount,
                currency: asset.currency,
                account_number: asset.accountNumber,
              }))
            );

          if (assetsError) {
            console.error('Assets error:', assetsError);
            throw new Error(`Failed to save assets: ${assetsError.message}`);
          }
          console.log('Assets saved successfully');
        }

        // Save debts
        if (data.financialDetails.debts.length > 0) {
          console.log('Saving debts...');
          const { error: debtsError } = await supabase
            .from('debts')
            .insert(
              data.financialDetails.debts.map(debt => ({
                user_id: user.id,
                debt_type: debt.debtType,
                balance: debt.balance,
                interest_rate: debt.interestRate,
                monthly_payment: debt.monthlyPayment,
                due_date: debt.dueDate?.toISOString().split('T')[0] || null,
              }))
            );

          if (debtsError) {
            console.error('Debts error:', debtsError);
            throw new Error(`Failed to save debts: ${debtsError.message}`);
          }
          console.log('Debts saved successfully');
        }

        // Save retirement savings
        if (data.financialDetails.retirementSavings.length > 0) {
          console.log('Saving retirement savings...');
          const { error: retirementError } = await supabase
            .from('retirement_savings')
            .insert(
              data.financialDetails.retirementSavings.map(saving => ({
                user_id: user.id,
                account_type: saving.accountType,
                institution_name: saving.institutionName,
                balance: saving.balance,
                contribution_amount: saving.contributionAmount,
                contribution_frequency: saving.contributionFrequency,
              }))
            );

          if (retirementError) {
            console.error('Retirement savings error:', retirementError);
            throw new Error(`Failed to save retirement savings: ${retirementError.message}`);
          }
          console.log('Retirement savings saved successfully');
        }

        // Save beneficiaries
        if (data.beneficiaries.length > 0) {
          console.log('Saving beneficiaries...');
          const { error: beneficiariesError } = await supabase
            .from('beneficiaries')
            .insert(
              data.beneficiaries.map(beneficiary => ({
                user_id: user.id,
                full_name: beneficiary.fullName,
                relationship: beneficiary.relationship,
                date_of_birth: beneficiary.dateOfBirth?.toISOString().split('T')[0] || null,
                percentage: beneficiary.percentage,
                is_primary: beneficiary.isPrimary,
                contact_email: beneficiary.contactEmail,
              }))
            );

          if (beneficiariesError) {
            console.error('Beneficiaries error:', beneficiariesError);
            throw new Error(`Failed to save beneficiaries: ${beneficiariesError.message}`);
          }
          console.log('Beneficiaries saved successfully');
        }

        console.log('All registration data saved successfully');
        return { success: true };
      } catch (error) {
        console.error('Registration submission failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Registration completed successfully');
      completeRegistration();
      toast.success('Registration completed successfully! Welcome to Secure Retire.');
      
      // Small delay to ensure state updates before navigation
      setTimeout(() => {
        navigate('/dashboard/overview');
      }, 500);
    },
    onError: (error: any) => {
      console.error('Registration submission error:', error);
      
      let errorMessage = 'Failed to complete registration. Please try again.';
      
      // Provide more specific error messages
      if (error.message?.includes('authentication') || error.message?.includes('auth')) {
        errorMessage = 'Authentication error. Please sign in again.';
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        errorMessage = 'Some data already exists. Please try refreshing the page.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    setError(null);
    submitRegistration.mutate();
  };

  const handleRetry = () => {
    setError(null);
    submitRegistration.mutate();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const totalAssets = data.financialDetails.assets.reduce((sum, asset) => sum + asset.amount, 0);
  const totalDebts = data.financialDetails.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalRetirement = data.financialDetails.retirementSavings.reduce((sum, saving) => sum + saving.balance, 0);
  const netWorth = totalAssets + totalRetirement - totalDebts;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Your Information</h2>
        <p className="text-muted-foreground">
          Please review all the information below before submitting your registration.
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-lg">{data.personalInfo.fullName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
              <p className="text-lg">
                {data.personalInfo.dateOfBirth 
                  ? format(data.personalInfo.dateOfBirth, 'PPP')
                  : 'Not provided'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-lg">{data.personalInfo.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Country</label>
              <p className="text-lg">{data.personalInfo.address.country || 'Not provided'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <p className="text-lg">
              {data.personalInfo.address.street && data.personalInfo.address.city
                ? `${data.personalInfo.address.street}, ${data.personalInfo.address.city}, ${data.personalInfo.address.state} ${data.personalInfo.address.zipCode}`
                : 'Not provided'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalAssets)}</div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalDebts)}</div>
              <div className="text-sm text-muted-foreground">Total Debts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{formatCurrency(totalRetirement)}</div>
              <div className="text-sm text-muted-foreground">Retirement</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(netWorth)}
              </div>
              <div className="text-sm text-muted-foreground">Net Worth</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Income Sources ({data.financialDetails.incomeSources.length})</h4>
              {data.financialDetails.incomeSources.length === 0 ? (
                <p className="text-muted-foreground">No income sources added</p>
              ) : (
                <div className="space-y-2">
                  {data.financialDetails.incomeSources.map((income, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{income.sourceType}</span>
                      <Badge variant="secondary">
                        {formatCurrency(income.amount)} {income.frequency}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Assets ({data.financialDetails.assets.length})</h4>
              {data.financialDetails.assets.length === 0 ? (
                <p className="text-muted-foreground">No assets added</p>
              ) : (
                <div className="space-y-2">
                  {data.financialDetails.assets.map((asset, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{asset.type} - {asset.institutionName}</span>
                      <Badge variant="secondary">{formatCurrency(asset.amount)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Beneficiaries ({data.beneficiaries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.beneficiaries.length === 0 ? (
            <p className="text-muted-foreground">No beneficiaries added</p>
          ) : (
            <div className="space-y-3">
              {data.beneficiaries.map((beneficiary, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{beneficiary.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {beneficiary.relationship} • {beneficiary.isPrimary ? 'Primary' : 'Contingent'}
                    </div>
                  </div>
                  <Badge variant={beneficiary.isPrimary ? 'default' : 'secondary'}>
                    {beneficiary.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ready to Submit Notice */}
      <Alert className="border-primary bg-primary/5">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          Ready to complete your registration! Review your information above and submit to access your dashboard.
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={submitRegistration.isPending}
              className="ml-4"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={submitRegistration.isPending}
          size="lg"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          {submitRegistration.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Your Information...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Complete Registration
            </>
          )}
        </Button>
      </div>

      {/* Success Message */}
      {data.isCompleted && (
        <Alert className="border-success bg-success/5">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Registration completed successfully! You can now access your dashboard.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}