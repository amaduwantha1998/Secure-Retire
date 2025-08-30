import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Zap, Shield, Crown, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRealTimeTranslation } from '@/hooks/useRealTimeTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useRegistrationStore, PricingInfo } from '@/stores/registrationStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const pricingSchema = z.object({
  selectedPlan: z.enum(['free', 'pro'], {
    required_error: 'Please select a plan',
  }),
});

type PricingForm = z.infer<typeof pricingSchema>;

const ONEPAY_CONFIG = {
  appId: '7BXP1189E5F3ECF3C48E9',
  appToken: 'bea769fdd80d0be3d45bce3fd4f1b9f05ea16b383418ca77ee',
  baseUrl: 'https://api.onepay.lk',
};

export default function PricingStep() {
  const { t: originalT } = useTranslation();
  const { t: translateText } = useRealTimeTranslation();
  const { user } = useAuth();
  const { data, updatePricingInfo } = useRegistrationStore();
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);

  const form = useForm<PricingForm>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      selectedPlan: data.pricingInfo.selectedPlan || 'free',
    },
  });

  const { watch } = form;
  const selectedPlan = watch('selectedPlan');

  // Auto-save form data
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      updatePricingInfo(values as PricingInfo);
    });
    return () => subscription.unsubscribe();
  }, [form, updatePricingInfo]);

  const handlePlanSelection = async (plan: 'free' | 'pro') => {
    form.setValue('selectedPlan', plan);
    updatePricingInfo({ selectedPlan: plan });

    // TODO: Uncomment after applying the database schema with subscriptions table
    // Save to Supabase subscriptions table
    /*
    if (user) {
      try {
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            plan_type: plan,
            payment_status: plan === 'free' ? 'active' : 'pending',
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error updating subscription:', error);
          toast.error('Failed to save plan selection');
        } else {
          toast.success(`${plan === 'free' ? 'Free' : 'Pro'} plan selected`);
        }
      } catch (error) {
        console.error('Subscription update error:', error);
        toast.error('Failed to save plan selection');
      }
    }
    */

    toast.success(`${plan === 'free' ? 'Free' : 'Pro'} plan selected`);

    if (plan === 'pro') {
      await handleProPayment();
    }
  };

  const handleProPayment = async () => {
    if (!user) {
      toast.error('Please log in to continue with Pro plan');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Initialize Onepay payment
      const paymentData = {
        app_id: ONEPAY_CONFIG.appId,
        app_token: ONEPAY_CONFIG.appToken,
        amount: 20.00,
        currency: 'LKR',
        customer_email: user.email,
        customer_name: data.personalInfo.fullName || user.user_metadata?.full_name,
        description: 'Secure Retire Pro Plan - Monthly Subscription',
        return_url: `${window.location.origin}/register?payment=success`,
        cancel_url: `${window.location.origin}/register?payment=cancelled`,
      };

      // Create Onepay checkout session
      const response = await fetch(`${ONEPAY_CONFIG.baseUrl}/v1/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ONEPAY_CONFIG.appToken}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const paymentSession = await response.json();
      
      // Update payment status
      updatePricingInfo({ 
        selectedPlan: 'pro',
        paymentStatus: 'pending',
        onepayTransactionId: paymentSession.session_id 
      });

      // Update Supabase with transaction ID
      // TODO: Uncomment after applying the database schema with subscriptions table
      /*
      await supabase
        .from('subscriptions')
        .update({
          payment_status: 'pending',
          onepay_transaction_id: paymentSession.session_id,
        })
        .eq('user_id', user.id);
      */

      // Redirect to Onepay checkout
      window.location.href = paymentSession.checkout_url;
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
      updatePricingInfo({ selectedPlan: 'free' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 'Rs 0',
      period: '/month',
      description: 'Perfect for getting started with retirement planning',
      features: [
        '100 credits per month',
        'Basic retirement calculator',
        'Financial overview dashboard',
        'Simple beneficiary management',
        'Email support',
      ],
      limitations: [
        'Limited AI consultations',
        'Basic document generation',
        'Standard customer support',
      ],
      badge: null,
      icon: Shield,
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 'Rs 20.00',
      period: '/month',
      description: 'Unlimited access to all premium features',
      features: [
        'Unlimited credits',
        'Advanced AI retirement advisor',
        'Comprehensive financial planning',
        'Professional document generation',
        'Investment recommendations',
        'Tax optimization strategies',
        'Priority customer support',
        'Advanced beneficiary management',
        'Portfolio rebalancing alerts',
        'Custom financial reports',
      ],
      limitations: [],
      badge: 'Most Popular',
      icon: Crown,
      popular: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold glass-text-primary">
          {translateText('pricing.title', 'Choose Your Plan')}
        </h2>
        <p className="text-lg glass-text-secondary max-w-2xl mx-auto">
          {translateText('pricing.subtitle', 'Select the plan that best fits your retirement planning needs. You can upgrade or downgrade at any time.')}
        </p>
      </div>

      <Form {...form}>
        <FormField
          control={form.control}
          name="selectedPlan"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isSelected = selectedPlan === plan.id;
                    
                    return (
                      <div key={plan.id} className="relative">
                        <RadioGroupItem
                          value={plan.id}
                          id={plan.id}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={plan.id}
                          className="cursor-pointer block"
                          onClick={() => handlePlanSelection(plan.id as 'free' | 'pro')}
                        >
                           <Card className={`
                             relative h-full transition-all duration-300 hover:scale-105
                             ${isSelected 
                               ? 'ring-2 ring-primary shadow-lg backdrop-blur-md bg-primary/5 dark:bg-primary/10' 
                               : 'backdrop-blur-md bg-white/30 dark:bg-gray-800/30 hover:bg-white/40 dark:hover:bg-gray-800/40'
                             }
                             ${plan.popular ? 'border-primary/50' : ''}
                             shadow-lg rounded-xl
                           `}
                           data-testid={`${plan.id}-plan`}>
                            {plan.badge && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <Badge className="px-3 py-1 bg-primary text-primary-foreground">
                                  {plan.badge}
                                </Badge>
                              </div>
                            )}
                            
                            <CardHeader className="text-center pb-4">
                              <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                                <Icon className="w-8 h-8 text-primary" />
                              </div>
                              <CardTitle className="text-xl glass-text-primary">
                                {translateText(`pricing.plans.${plan.id}.name`, plan.name)}
                              </CardTitle>
                              <div className="flex items-baseline justify-center space-x-1">
                                <span className="text-3xl font-bold glass-text-primary">
                                  {plan.price}
                                </span>
                                <span className="text-sm glass-text-muted">
                                  {translateText('pricing.period', plan.period)}
                                </span>
                              </div>
                              <p className="text-sm glass-text-secondary mt-2">
                                {translateText(`pricing.plans.${plan.id}.description`, plan.description)}
                              </p>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                <h4 className="font-medium glass-text-primary">
                                  {translateText('pricing.features_included', 'Features included:')}
                                </h4>
                                <ul className="space-y-2">
                                  {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center space-x-3">
                                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                                      <span className="text-sm glass-text-secondary">
                                        {translateText(`pricing.features.${plan.id}.${index}`, feature)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {plan.limitations.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-border/50">
                                  <h4 className="font-medium glass-text-muted">
                                    {translateText('pricing.limitations', 'Limitations:')}
                                  </h4>
                                  <ul className="space-y-2">
                                    {plan.limitations.map((limitation, index) => (
                                      <li key={index} className="flex items-center space-x-3">
                                        <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />
                                        <span className="text-sm glass-text-muted">
                                          {translateText(`pricing.limitations.${plan.id}.${index}`, limitation)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="pt-4">
                                <Button 
                                  type="button"
                                  className={`w-full ${
                                    isSelected 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                  }`}
                                  disabled={isProcessingPayment && plan.id === 'pro'}
                                  onClick={() => handlePlanSelection(plan.id as 'free' | 'pro')}
                                >
                                  {isProcessingPayment && plan.id === 'pro' ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      {translateText('pricing.processing_payment', 'Processing Payment...')}
                                    </>
                                  ) : isSelected ? (
                                    <>
                                      <Check className="w-4 h-4 mr-2" />
                                      {translateText('pricing.selected', 'Selected')}
                                    </>
                                  ) : plan.id === 'pro' ? (
                                    <>
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      {translateText('pricing.select_and_pay', `Select & Pay ${plan.price.replace('Rs ', '')}`)}
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-4 w-4 mr-2" />
                                      {translateText('pricing.select_free', 'Select Free Plan')}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>

                            {isSelected && (
                              <div className="absolute -top-2 -right-2 bg-success rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </Card>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </Form>

      <div className="text-center text-sm glass-text-muted">
        <p>{translateText('pricing.change_anytime', '💡 You can change your plan anytime from your dashboard settings')}</p>
        <p className="mt-1">{translateText('pricing.secure_payment', '🔒 All payments are processed securely through Onepay')}</p>
      </div>
    </div>
  );
}