import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyService } from '@/services/currencyService';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  convertAmount: (amount: number, fromCurrency: string) => number;
  formatAmount: (amount: number, fromCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState('LKR');

  useEffect(() => {
    // Load saved currency preference
    const saved = localStorage.getItem('preferredCurrency');
    if (saved) {
      setSelectedCurrencyState(saved);
    }
    
    // Initialize currency service
    currencyService.updateRates();
  }, []);

  const setSelectedCurrency = (currency: string) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem('preferredCurrency', currency);
  };

  const convertAmount = (amount: number, fromCurrency: string = 'LKR') => {
    return currencyService.convert(amount, fromCurrency, selectedCurrency);
  };

  const formatAmount = (amount: number, fromCurrency?: string) => {
    const convertedAmount = fromCurrency ? convertAmount(amount, fromCurrency) : amount;
    return currencyService.formatCurrency(convertedAmount, selectedCurrency);
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency,
      convertAmount,
      formatAmount
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}