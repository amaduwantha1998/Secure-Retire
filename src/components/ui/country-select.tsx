import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { COUNTRIES } from '@/services/currencyService';

interface CountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onValueChange,
  placeholder = "Select country...",
  className,
  disabled = false,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCountry = COUNTRIES.find((country) => country.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select country"
          data-testid="country-select"
          className={cn(
            "w-full justify-between backdrop-blur-md bg-background/30 border-border/50 hover:bg-background/40",
            className
          )}
          disabled={disabled}
        >
          {selectedCountry ? selectedCountry.name : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 backdrop-blur-md bg-background/95 border-border/50 shadow-lg">
        <Command>
          <CommandInput placeholder="Search countries..." className="h-9" />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {COUNTRIES.map((country) => (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={() => {
                  onValueChange(country.code);
                  setOpen(false);
                }}
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50"
              >
                <div className="flex items-center">
                  <span>{country.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({country.currency})
                  </span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === country.code ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}