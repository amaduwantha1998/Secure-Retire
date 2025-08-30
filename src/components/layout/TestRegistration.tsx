import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistrationStore } from '@/stores/registrationStore';
import { CheckCircle, User, DollarSign, Users } from 'lucide-react';

export default function TestRegistration() {
  const { user } = useAuth();
  const { data, resetRegistration } = useRegistrationStore();

  const testData = {
    hasUser: !!user,
    currentStep: data.currentStep,
    isCompleted: data.isCompleted,
    hasPersonalInfo: !!(data.personalInfo.fullName && data.personalInfo.dateOfBirth),
    hasFinancialData: data.financialDetails.incomeSources.length > 0 || 
                     data.financialDetails.assets.length > 0 || 
                     data.financialDetails.debts.length > 0 || 
                     data.financialDetails.retirementSavings.length > 0,
    hasBeneficiaries: data.beneficiaries.length > 0,
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Registration System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${testData.hasUser ? 'bg-success/5 border-success' : 'bg-destructive/5 border-destructive'}`}>
              <div className="text-sm font-medium">User Authentication</div>
              <div className={`text-lg font-bold ${testData.hasUser ? 'text-success' : 'text-destructive'}`}>
                {testData.hasUser ? 'Authenticated' : 'Not Authenticated'}
              </div>
              {user && <div className="text-xs text-muted-foreground">{user.email}</div>}
            </div>

            <div className="p-4 rounded-lg border bg-muted/5 border-muted">
              <div className="text-sm font-medium">Current Step</div>
              <div className="text-lg font-bold">{testData.currentStep}/4</div>
            </div>

            <div className={`p-4 rounded-lg border ${testData.isCompleted ? 'bg-success/5 border-success' : 'bg-muted/5 border-muted'}`}>
              <div className="text-sm font-medium">Registration Status</div>
              <div className={`text-lg font-bold ${testData.isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                {testData.isCompleted ? 'Completed' : 'In Progress'}
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${testData.hasPersonalInfo ? 'bg-success/5 border-success' : 'bg-muted/5 border-muted'}`}>
              <div className="text-sm font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                Personal Info
              </div>
              <div className={`text-lg font-bold ${testData.hasPersonalInfo ? 'text-success' : 'text-muted-foreground'}`}>
                {testData.hasPersonalInfo ? 'Complete' : 'Pending'}
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${testData.hasFinancialData ? 'bg-success/5 border-success' : 'bg-muted/5 border-muted'}`}>
              <div className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Financial Data
              </div>
              <div className={`text-lg font-bold ${testData.hasFinancialData ? 'text-success' : 'text-muted-foreground'}`}>
                {testData.hasFinancialData ? 'Has Data' : 'Empty'}
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${testData.hasBeneficiaries ? 'bg-success/5 border-success' : 'bg-muted/5 border-muted'}`}>
              <div className="text-sm font-medium flex items-center gap-1">
                <Users className="h-3 w-3" />
                Beneficiaries
              </div>
              <div className={`text-lg font-bold ${testData.hasBeneficiaries ? 'text-success' : 'text-muted-foreground'}`}>
                {data.beneficiaries.length} Added
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Quick Actions</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={resetRegistration} 
                variant="outline" 
                size="sm"
              >
                Reset Registration Data
              </Button>
              <Button 
                onClick={() => window.location.href = '/register'} 
                variant="outline" 
                size="sm"
              >
                Go to Registration
              </Button>
              <Button 
                onClick={() => window.location.href = '/dashboard/overview'} 
                variant="outline" 
                size="sm"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Current Data Summary</h4>
            <div className="text-sm text-muted-foreground">
              <div>Personal Info: {data.personalInfo.fullName || 'Not set'}</div>
              <div>Income Sources: {data.financialDetails.incomeSources.length}</div>
              <div>Assets: {data.financialDetails.assets.length}</div>
              <div>Debts: {data.financialDetails.debts.length}</div>
              <div>Retirement Accounts: {data.financialDetails.retirementSavings.length}</div>
              <div>Beneficiaries: {data.beneficiaries.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}