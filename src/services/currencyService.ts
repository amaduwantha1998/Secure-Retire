// Currency service for Open Exchange Rates API
// Note: You'll need to add your API key when you set up environment variables

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyData {
  rates: ExchangeRates;
  base: string;
  timestamp: number;
}

export const SUPPORTED_CURRENCIES = [
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export const COUNTRIES = [
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR' },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'TH', name: 'Thailand', currency: 'THB' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR' },
  { code: 'PH', name: 'Philippines', currency: 'PHP' },
  { code: 'VN', name: 'Vietnam', currency: 'VND' },
];

class CurrencyService {
  private baseCurrency = 'USD';
  private rates: ExchangeRates = {};
  private lastUpdate = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  async fetchRates(): Promise<CurrencyData | null> {
    // Mock data for now - replace with actual API call when you have the key
    // const API_KEY = import.meta.env.VITE_OPEN_EXCHANGE_RATES_KEY;
    // const url = `https://openexchangerates.org/api/latest.json?app_id=${API_KEY}`;
    
    // For now, return mock data
    return {
      rates: {
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        CNY: 6.45,
        LKR: 320.0,
        INR: 83.0,
        PKR: 280.0,
        BDT: 110.0,
        MYR: 4.7,
        SGD: 1.35,
        THB: 36.0,
        IDR: 15500.0,
        PHP: 56.0,
        VND: 24000.0,
      },
      base: 'USD',
      timestamp: Date.now()
    };
  }

  async updateRates(): Promise<void> {
    if (Date.now() - this.lastUpdate < this.CACHE_DURATION) {
      return; // Use cached rates
    }

    try {
      const data = await this.fetchRates();
      if (data) {
        this.rates = data.rates;
        this.lastUpdate = Date.now();
        
        // Cache in localStorage
        localStorage.setItem('exchangeRates', JSON.stringify({
          rates: this.rates,
          timestamp: this.lastUpdate
        }));
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Try to load from cache
      this.loadFromCache();
    }
  }

  private loadFromCache(): void {
    try {
      const cached = localStorage.getItem('exchangeRates');
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < this.CACHE_DURATION * 24) { // Use cache up to 24 hours
          this.rates = data.rates;
          this.lastUpdate = data.timestamp;
        }
      }
    } catch (error) {
      console.error('Failed to load cached rates:', error);
    }
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to USD first if needed
    let usdAmount = amount;
    if (fromCurrency !== this.baseCurrency) {
      usdAmount = amount / (this.rates[fromCurrency] || 1);
    }
    
    // Convert from USD to target currency
    if (toCurrency === this.baseCurrency) {
      return usdAmount;
    }
    
    return usdAmount * (this.rates[toCurrency] || 1);
  }

  formatCurrency(amount: number, currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) return `${amount.toFixed(2)} ${currencyCode}`;
    
    return `${currency.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  getCurrencySymbol(currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  }
}

export const currencyService = new CurrencyService();