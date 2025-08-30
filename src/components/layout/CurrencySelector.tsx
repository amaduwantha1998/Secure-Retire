import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DollarSign } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../../services/currencyService';
import { useCurrency } from '@/contexts/CurrencyContext';

export const CurrencySelector: React.FC = () => {
  const { t } = useTranslation();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();

  const currentCurrency = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1" data-testid="currency-selector">
          <DollarSign className="w-4 h-4" />
          <span className="hidden sm:inline">{currentCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SUPPORTED_CURRENCIES.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => setSelectedCurrency(currency.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center space-x-2">
              <span>{currency.symbol}</span>
              <span>{currency.code}</span>
            </span>
            <span className="text-xs text-muted-foreground">{currency.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};