import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistrationStore } from '@/stores/registrationStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const RegistrationDebug: React.FC = () => {
  const { user, session } = useAuth();
  const { data } = useRegistrationStore();
  const { toast } = useToast();

  const testDatabaseConnection = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        toast({
          title: 'Database Test Failed',
          description: error.message,
          variant: 'destructive',
        });
        console.error('Database test error:', error);
      } else {
        toast({
          title: 'Database Test Successful',
          description: 'Connection and RLS policies working correctly',
        });
        console.log('User data from database:', userData);
      }
    } catch (error) {
      console.error('Database test exception:', error);
      toast({
        title: 'Database Test Exception',
        description: 'Failed to test database connection',
        variant: 'destructive',
      });
    }
  };

  const testDataSaving = async () => {
    try {
      // Test saving a simple income source
      const testIncome = {
        user_id: user?.id,
        source_type: 'Test Income',
        amount: 1000,
        frequency: 'monthly' as const,
        currency: 'USD',
      };

      const { data: incomeData, error } = await supabase
        .from('income_sources')
        .insert(testIncome)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Data Save Test Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Data Save Test Successful',
          description: 'Test data saved successfully',
        });
        
        // Clean up test data
        await supabase
          .from('income_sources')
          .delete()
          .eq('id', incomeData.id);
      }
    } catch (error) {
      console.error('Data save test error:', error);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
      <h3 className="text-lg font-semibold">Registration Debug Panel</h3>
      
      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span>User:</span>
            <Badge variant={user ? 'default' : 'destructive'}>
              {user ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </div>
          {user && (
            <>
              <div>Email: {user.email}</div>
              <div>ID: {user.id}</div>
              <div>Full Name: {user.user_metadata?.full_name || 'Not set'}</div>
              <div>Phone: {user.user_metadata?.phone || 'Not set'}</div>
            </>
          )}
          <div className="flex items-center gap-2">
            <span>Session:</span>
            <Badge variant={session ? 'default' : 'destructive'}>
              {session ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Registration State */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>Current Step: {data.currentStep}</div>
          <div>Completed: {data.isCompleted ? 'Yes' : 'No'}</div>
          <div>Personal Info Complete: {data.personalInfo.fullName ? 'Yes' : 'No'}</div>
          <div>Income Sources: {data.financialDetails.incomeSources.length}</div>
          <div>Beneficiaries: {data.beneficiaries.length}</div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={testDatabaseConnection}
            className="w-full"
            disabled={!user}
          >
            Test Database Connection
          </Button>
          <Button 
            onClick={testDataSaving}
            className="w-full"
            disabled={!user}
          >
            Test Data Saving
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationDebug;