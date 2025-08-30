import { supabase } from '@/integrations/supabase/client';

export interface FinancialData {
  user: any;
  incomeSources: any[];
  assets: any[];
  debts: any[];
  retirementSavings: any[];
}

export interface FinancialSummary {
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  monthlyIncome: number;
  monthlySavings: number;
  debtToIncomeRatio: number;
  retirementReadinessScore: number;
}

// Individual API functions for better data management
export const getIncomeSourcesAPI = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getAssetsAPI = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getDebtsAPI = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getRetirementSavingsAPI = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('retirement_savings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Subscription and Credits API functions
export const getSubscriptionAPI = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  try {
    // TODO: Uncomment after applying database schema
    // const { data, error } = await supabase
    //   .from('subscriptions')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .maybeSingle();

    // if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    // return data;
    
    // Mock data for now - remove after schema is applied
    return null;
  } catch (error) {
    console.warn('Subscriptions table not found - using default values');
    return null;
  }
};

// Create payment link for Pro upgrade
export const createPaymentLinkAPI = async (planType: string, amount: number, currency: string) => {
  const { data, error } = await supabase.functions.invoke('create-payment-link', {
    body: {
      plan_type: planType,
      amount: amount,
      currency: currency,
      redirect_url: `${window.location.origin}/dashboard/profile?tab=subscription&payment=success`
    }
  });

  if (error) {
    console.error('Payment link creation error:', error);
    throw new Error('Failed to create payment link');
  }

  return data;
};

export const getCreditsAPI = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  try {
    // TODO: Uncomment after applying database schema
    // const { data, error } = await supabase
    //   .from('credits')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .maybeSingle();

    // if (error && error.code !== 'PGRST116') throw error;
    // return data;
    
    // Mock data for now - remove after schema is applied
    return null;
  } catch (error) {
    console.warn('Credits table not found - using default values');
    return null;
  }
};

export interface SubscriptionData {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro';
  start_date: string;
  end_date?: string;
  payment_status: 'active' | 'expired' | 'cancelled' | 'pending';
  onepay_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditsData {
  id: string;
  user_id: string;
  available_credits: number;
  used_credits: number;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

export class FinancialDataService {
  /**
   * Fetch all financial data for the current user
   */
  static async fetchFinancialData(): Promise<FinancialData> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    // Fetch income sources
    const { data: incomeSources, error: incomeError } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (incomeError) {
      console.error('Error fetching income sources:', incomeError);
    }

    // Fetch assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
    }

    // Fetch debts
    const { data: debts, error: debtsError } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (debtsError) {
      console.error('Error fetching debts:', debtsError);
    }

    // Fetch retirement savings
    const { data: retirementSavings, error: retirementError } = await supabase
      .from('retirement_savings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (retirementError) {
      console.error('Error fetching retirement savings:', retirementError);
    }

    return {
      user: userProfile || user,
      incomeSources: incomeSources || [],
      assets: assets || [],
      debts: debts || [],
      retirementSavings: retirementSavings || [],
    };
  }

  /**
   * Calculate financial summary metrics
   */
  static calculateFinancialSummary(data: FinancialData): FinancialSummary {
    // Calculate total assets
    const totalAssets = data.assets.reduce((sum, asset) => sum + (asset.amount || 0), 0);
    
    // Calculate total retirement savings
    const totalRetirement = data.retirementSavings.reduce((sum, saving) => sum + (saving.balance || 0), 0);
    
    // Calculate total debts
    const totalDebts = data.debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
    
    // Calculate net worth
    const netWorth = totalAssets + totalRetirement - totalDebts;
    
    // Calculate monthly income
    const monthlyIncome = data.incomeSources.reduce((sum, source) => {
      const amount = source.amount || 0;
      switch (source.frequency) {
        case 'weekly':
          return sum + (amount * 4.33); // Average weeks per month
        case 'biweekly':
          return sum + (amount * 2.17); // Average biweeks per month
        case 'monthly':
          return sum + amount;
        case 'quarterly':
          return sum + (amount / 3);
        case 'annually':
          return sum + (amount / 12);
        default:
          return sum + amount;
      }
    }, 0);

    // Calculate monthly savings (retirement contributions)
    const monthlySavings = data.retirementSavings.reduce((sum, saving) => {
      const amount = saving.contribution_amount || 0;
      switch (saving.contribution_frequency) {
        case 'weekly':
          return sum + (amount * 4.33);
        case 'biweekly':
          return sum + (amount * 2.17);
        case 'monthly':
          return sum + amount;
        case 'quarterly':
          return sum + (amount / 3);
        case 'annually':
          return sum + (amount / 12);
        default:
          return sum + amount;
      }
    }, 0);

    // Calculate debt-to-income ratio
    const monthlyDebtPayments = data.debts.reduce((sum, debt) => sum + (debt.monthly_payment || 0), 0);
    const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;

    // Calculate retirement readiness score (0-100)
    const retirementReadinessScore = this.calculateRetirementReadinessScore({
      totalAssets,
      totalRetirement,
      totalDebts,
      monthlyIncome,
      monthlySavings,
      debtToIncomeRatio,
      age: this.calculateAge(data.user?.date_of_birth),
    });

    return {
      totalAssets,
      totalDebts,
      netWorth,
      monthlyIncome,
      monthlySavings,
      debtToIncomeRatio,
      retirementReadinessScore,
    };
  }

  /**
   * Calculate retirement readiness score based on various factors
   */
  private static calculateRetirementReadinessScore(metrics: {
    totalAssets: number;
    totalRetirement: number;
    totalDebts: number;
    monthlyIncome: number;
    monthlySavings: number;
    debtToIncomeRatio: number;
    age: number;
  }): number {
    let score = 0;
    const { totalRetirement, monthlyIncome, monthlySavings, debtToIncomeRatio, age } = metrics;

    // Retirement savings factor (0-40 points)
    const recommendedRetirement = monthlyIncome * 12 * Math.max(age - 25, 0) * 0.15; // 15% rule
    const retirementRatio = totalRetirement / Math.max(recommendedRetirement, 1);
    score += Math.min(retirementRatio * 40, 40);

    // Savings rate factor (0-25 points)
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    if (savingsRate >= 15) score += 25;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;
    else score += savingsRate * 2;

    // Debt factor (0-20 points)
    if (debtToIncomeRatio <= 20) score += 20;
    else if (debtToIncomeRatio <= 36) score += 15;
    else if (debtToIncomeRatio <= 50) score += 10;
    else score += Math.max(0, 10 - (debtToIncomeRatio - 50) / 5);

    // Age factor (0-15 points)
    if (age <= 30) score += 15;
    else if (age <= 40) score += 12;
    else if (age <= 50) score += 8;
    else if (age <= 60) score += 5;
    else score += 2;

    return Math.round(Math.min(Math.max(score, 0), 100));
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dateOfBirth: string | null): number {
    if (!dateOfBirth) return 35; // Default age if not provided
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Convert currency amounts based on user preference
   */
  static convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    // For demo purposes, return the same amount
    // In production, you would use a real currency conversion API
    if (fromCurrency === toCurrency) return amount;
    
    // Simple mock conversion rates
    const rates: { [key: string]: number } = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'CAD': 1.25,
      'JPY': 110,
    };

    const usdAmount = amount / (rates[fromCurrency] || 1);
    return usdAmount * (rates[toCurrency] || 1);
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}