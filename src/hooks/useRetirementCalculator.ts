import { useState, useCallback } from 'react';
import { FinancialDataService } from '@/services/api';

interface RetirementGoals {
  targetRetirementAge: number;
  currentAge: number;
  desiredMonthlyIncome: number;
  inflationRate: number;
  expectedReturn: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  lifestyleLevel: 'basic' | 'comfortable' | 'luxury';
  region: string;
}

interface RetirementProjection {
  totalNeeded: number;
  currentSavings: number;
  savingsGap: number;
  monthlyContributionNeeded: number;
  projectedPortfolioValue: number;
  successProbability: number;
  yearlyProjections: Array<{
    age: number;
    portfolioValue: number;
    contributions: number;
    withdrawals: number;
  }>;
  monteCarloResults: {
    percentile10: number;
    percentile50: number;
    percentile90: number;
    successRate: number;
  };
}

// Regional adjustment factors
const REGIONAL_FACTORS = {
  US: { inflation: 1.0, tax: 0.22, socialSecurity: 0.40 },
  CA: { inflation: 1.02, tax: 0.26, socialSecurity: 0.35 },
  UK: { inflation: 1.05, tax: 0.28, socialSecurity: 0.30 },
  AU: { inflation: 1.03, tax: 0.24, socialSecurity: 0.25 },
  EU: { inflation: 1.04, tax: 0.30, socialSecurity: 0.45 }
};

export function useRetirementCalculator() {
  const [loading, setLoading] = useState(false);
  const [projection, setProjection] = useState<RetirementProjection | null>(null);

  // Monte Carlo simulation
  const runMonteCarloSimulation = useCallback((
    initialValue: number,
    monthlyContribution: number,
    years: number,
    expectedReturn: number,
    volatility: number,
    iterations: number = 1000
  ) => {
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      let portfolioValue = initialValue;
      
      for (let year = 0; year < years; year++) {
        // Generate random return using normal distribution
        const randomReturn = expectedReturn + (Math.random() - 0.5) * volatility * 2;
        const annualReturn = 1 + (randomReturn / 100);
        
        // Apply annual growth and monthly contributions
        portfolioValue = portfolioValue * annualReturn + (monthlyContribution * 12);
      }
      
      results.push(portfolioValue);
    }
    
    results.sort((a, b) => a - b);
    
    return {
      percentile10: results[Math.floor(iterations * 0.1)],
      percentile50: results[Math.floor(iterations * 0.5)],
      percentile90: results[Math.floor(iterations * 0.9)],
      successRate: (results.filter(r => r >= initialValue * 25).length / iterations) * 100 // 4% withdrawal rule
    };
  }, []);

  const calculateRetirement = useCallback(async (goals: RetirementGoals) => {
    setLoading(true);
    
    try {
      // Fetch current financial data
      const financialData = await FinancialDataService.fetchFinancialData();
      const summary = FinancialDataService.calculateFinancialSummary(financialData);
      
      const yearsToRetirement = goals.targetRetirementAge - goals.currentAge;
      const regionalFactor = REGIONAL_FACTORS[goals.region as keyof typeof REGIONAL_FACTORS] || REGIONAL_FACTORS.US;
      
      // Adjust for regional inflation and taxes
      const adjustedInflation = goals.inflationRate * regionalFactor.inflation;
      const adjustedReturn = goals.expectedReturn * (1 - regionalFactor.tax);
      
      // Calculate total needed at retirement (adjusted for inflation)
      const futureValue = goals.desiredMonthlyIncome * 12 * Math.pow(1 + adjustedInflation / 100, yearsToRetirement);
      const totalNeeded = futureValue * 25; // 4% withdrawal rule
      
      // Current retirement savings from assets (approximate from net worth and retirement accounts)
      const currentSavings = financialData.retirementSavings?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
      
      // Future value of current savings
      const futureCurrentSavings = currentSavings * Math.pow(1 + adjustedReturn / 100, yearsToRetirement);
      
      // Savings gap
      const savingsGap = Math.max(0, totalNeeded - futureCurrentSavings);
      
      // Monthly contribution needed
      const monthsToRetirement = yearsToRetirement * 12;
      const monthlyRate = adjustedReturn / 100 / 12;
      const monthlyContributionNeeded = savingsGap / (((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate) || monthsToRetirement);
      
      // Generate yearly projections
      const yearlyProjections = [];
      let portfolioValue = currentSavings;
      
      for (let i = 0; i <= yearsToRetirement; i++) {
        const age = goals.currentAge + i;
        const annualContribution = monthlyContributionNeeded * 12;
        
        if (i > 0) {
          portfolioValue = portfolioValue * (1 + adjustedReturn / 100) + annualContribution;
        }
        
        yearlyProjections.push({
          age,
          portfolioValue,
          contributions: annualContribution,
          withdrawals: 0
        });
      }
      
      // Run Monte Carlo simulation
      const volatility = goals.riskTolerance === 'conservative' ? 8 : 
                        goals.riskTolerance === 'moderate' ? 12 : 18;
      
      const monteCarloResults = runMonteCarloSimulation(
        currentSavings,
        monthlyContributionNeeded,
        yearsToRetirement,
        adjustedReturn,
        volatility
      );
      
      // Calculate success probability based on current trajectory
      const projectedValue = futureCurrentSavings + (monthlyContributionNeeded * 12 * yearsToRetirement * 1.5);
      const successProbability = Math.min(100, (projectedValue / totalNeeded) * 100 * 0.8);
      
      const projection: RetirementProjection = {
        totalNeeded,
        currentSavings,
        savingsGap,
        monthlyContributionNeeded,
        projectedPortfolioValue: portfolioValue,
        successProbability,
        yearlyProjections,
        monteCarloResults
      };
      
      setProjection(projection);
    } catch (error) {
      console.error('Error calculating retirement projection:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [runMonteCarloSimulation]);

  return {
    loading,
    projection,
    calculateRetirement
  };
}