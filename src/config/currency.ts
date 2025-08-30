// Currency configuration for Secure Retire
// Default currency is set to USD for Stripe integration

export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_COUNTRY = 'US';

// Exchange rates (approximate values, should be fetched from API in production)
export const EXCHANGE_RATES = {
  USD_TO_LKR: 320.0,
  LKR_TO_USD: 1 / 320.0,
} as const;

// Pricing configuration - Pro plan now $1 USD
export const PRICING = {
  PRO_PLAN_USD: 1,
  PRO_PLAN_LKR: 320, // Equivalent in LKR
  FREE_PLAN_CREDITS: 100,
  PRO_PLAN_CREDITS: -1, // Unlimited
} as const;

// Stripe configuration
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51...', // Will be set via environment variable
  PRO_PLAN_PRICE_ID: 'price_1...', // Will be set based on actual Stripe price
  SUPPORTED_CURRENCIES: ['USD'],
} as const;

// Currency formatting utilities
export const formatCurrency = (amount: number, currency: string = DEFAULT_CURRENCY): string => {
  const formatters = {
    LKR: (val: number) => `Rs ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    USD: (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    EUR: (val: number) => `€${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    GBP: (val: number) => `£${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };

  const formatter = formatters[currency as keyof typeof formatters];
  return formatter ? formatter(amount) : `${amount.toFixed(2)} ${currency}`;
};

// Convert between currencies
export const convertCurrency = (amount: number, from: string, to: string): number => {
  if (from === to) return amount;
  
  // For now, only handle LKR <-> USD conversion
  if (from === 'USD' && to === 'LKR') {
    return amount * EXCHANGE_RATES.USD_TO_LKR;
  }
  
  if (from === 'LKR' && to === 'USD') {
    return amount * EXCHANGE_RATES.LKR_TO_USD;
  }
  
  // For other currencies, return as-is (should implement proper conversion)
  return amount;
};