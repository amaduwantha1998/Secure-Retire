import { CreditOperation, CREDIT_COSTS } from '@/hooks/useCreditSystem';

// Define all credit operations used throughout the app
export const CREDIT_OPERATIONS: Record<string, CreditOperation> = {
  // Retirement Calculator
  RETIREMENT_CALCULATION: {
    feature: 'Retirement Calculator',
    cost: CREDIT_COSTS.RETIREMENT_CALCULATION,
    description: 'Calculate retirement projections and savings goals',
  },

  // AI Features
  AI_FINANCIAL_INSIGHT: {
    feature: 'AI Financial Insight',
    cost: CREDIT_COSTS.AI_INSIGHT,
    description: 'Get AI-powered insights on your financial data',
  },

  AI_INVESTMENT_ADVICE: {
    feature: 'AI Investment Recommendation',
    cost: CREDIT_COSTS.INVESTMENT_RECOMMENDATION,
    description: 'Receive personalized investment recommendations',
  },

  AI_CONSULTATION: {
    feature: 'AI Consultation',
    cost: CREDIT_COSTS.AI_CONSULTATION,
    description: 'Interactive AI consultation session',
  },

  // Document Generation
  WILL_GENERATION: {
    feature: 'Will Generation',
    cost: CREDIT_COSTS.WILL_GENERATION,
    description: 'Generate legal will documents',
  },

  DOCUMENT_GENERATION: {
    feature: 'Document Generation',
    cost: CREDIT_COSTS.DOCUMENT_GENERATION,
    description: 'Generate financial planning documents',
  },

  // Analysis Features
  PORTFOLIO_ANALYSIS: {
    feature: 'Portfolio Analysis',
    cost: CREDIT_COSTS.PORTFOLIO_ANALYSIS,
    description: 'Analyze investment portfolio performance',
  },

  TAX_ESTIMATION: {
    feature: 'Tax Estimation',
    cost: CREDIT_COSTS.TAX_ESTIMATION,
    description: 'Calculate tax estimates and optimization strategies',
  },

  // Translation
  REAL_TIME_TRANSLATION: {
    feature: 'Real-time Translation',
    cost: CREDIT_COSTS.TRANSLATION,
    description: 'Translate content to your preferred language',
  },

  // Financial Planning
  FINANCIAL_ADVICE: {
    feature: 'Financial Advice',
    cost: CREDIT_COSTS.FINANCIAL_ADVICE,
    description: 'Get personalized financial planning advice',
  },
};

// Helper function to get operation by key
export const getCreditOperation = (key: keyof typeof CREDIT_OPERATIONS): CreditOperation => {
  return CREDIT_OPERATIONS[key];
};

// Check if a feature requires credits
export const isFeatureRestricted = (featureKey: string): boolean => {
  return featureKey in CREDIT_OPERATIONS;
};

// Get total cost for multiple operations
export const calculateTotalCost = (operations: CreditOperation[]): number => {
  return operations.reduce((total, op) => total + op.cost, 0);
};