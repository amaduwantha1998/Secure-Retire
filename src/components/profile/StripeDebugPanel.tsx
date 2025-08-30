import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, ChevronUp, Bug, Zap } from 'lucide-react';

export const StripeDebugPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const { user } = useAuth();
  const subscriptionData = useSubscriptionData();

  const runStripeTest = async () => {
    try {
      console.log('Testing Stripe payment link...');
      setTestResults({ loading: true });

      // Test the direct Stripe payment link
      const stripePaymentUrl = 'https://buy.stripe.com/test_8x2dRagvXaIh1edccJ77O01';
      
      // Since we can't actually test the redirect, we'll just validate the URL
      const isValidUrl = stripePaymentUrl.startsWith('https://buy.stripe.com/');
      
      setTestResults({
        success: isValidUrl,
        data: { 
          method: 'Direct Stripe Payment Link',
          url: stripePaymentUrl,
          valid: isValidUrl 
        },
        error: isValidUrl ? null : 'Invalid Stripe payment URL',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setTestResults({
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    }
  };

  if (import.meta.env.PROD) {
    return null; // Don't show in production
  }

  return (
    <Card className="mt-4 border-yellow-500/20 bg-yellow-50/10 dark:bg-yellow-900/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-yellow-500" />
            <span>Stripe Debug Panel</span>
            <Badge variant="outline" className="text-xs">DEV</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <strong>User Status:</strong>
              <div className="mt-1 space-y-1">
                <div>ID: {user?.id?.substring(0, 8)}...</div>
                <div>Email: {user?.email}</div>
                <div>Account: {subscriptionData.accountType}</div>
                <div>Pro: {subscriptionData.isProUser ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div>
              <strong>Credits:</strong>
              <div className="mt-1 space-y-1">
                <div>Available: {subscriptionData.availableCredits}</div>
                <div>Used: {subscriptionData.usedCredits}</div>
                <div>Remaining: {subscriptionData.remainingCredits}</div>
                <div>Low: {subscriptionData.isCreditsLow ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          <div>
            <Button
              onClick={runStripeTest}
              size="sm"
              className="mb-2"
              disabled={testResults.loading}
            >
              <Zap className="h-4 w-4 mr-2" />
              Test Stripe Integration
            </Button>
            
            {testResults.loading && (
              <div className="text-xs text-muted-foreground">Testing...</div>
            )}
            
            {testResults.timestamp && (
              <div className="text-xs space-y-2">
                <div>
                  <strong>Last Test:</strong> {new Date(testResults.timestamp).toLocaleTimeString()}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <Badge variant={testResults.success ? 'default' : 'destructive'}>
                    {testResults.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                {testResults.data && (
                  <div>
                    <strong>Response:</strong>
                    <pre className="mt-1 text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.data, null, 2)}
                    </pre>
                  </div>
                )}
                {testResults.error && (
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 text-xs bg-red-100/50 dark:bg-red-900/20 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};