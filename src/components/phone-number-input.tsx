'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type PhoneNumberInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  className?: string;
};

const countries = getCountries();

function countryFlag(country: CountryCode) {
  return country.toUpperCase().split('')
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('');
}

function countryFromNumber(value: string): CountryCode {
  if (!value.startsWith('+')) return 'LK';
  const matchingCode = [...new Set(countries.map(getCountryCallingCode))]
    .sort((a, b) => b.length - a.length)
    .find((code) => value.startsWith(`+${code}`));
  return countries.find((country) => getCountryCallingCode(country) === matchingCode) ?? 'LK';
}

export function PhoneNumberInput({ id, value, onChange, name, required, className }: PhoneNumberInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => countryFromNumber(value));
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const displayNames = useMemo(() => new Intl.DisplayNames(['en'], { type: 'region' }), []);
  const callingCode = `+${getCountryCallingCode(selectedCountry)}`;
  const maxLocalLength = 15 - callingCode.length + 1;
  const localNumber = value.startsWith(callingCode) ? value.slice(callingCode.length) : value.replace(/\D/g, '');

  const countryOptions = useMemo(() => countries.map((country) => ({
    country,
    name: displayNames.of(country) ?? country,
    callingCode: `+${getCountryCallingCode(country)}`,
  })).sort((a, b) => a.name.localeCompare(b.name)), [displayNames]);

  const filteredCountries = countryOptions.filter(({ country, name, callingCode: code }) => {
    const query = search.trim().toLowerCase();
    return !query || name.toLowerCase().includes(query) || country.toLowerCase().includes(query) || code.includes(query);
  });

  const updateNumber = (country: CountryCode, digits: string) => {
    const maxDigits = 15 - getCountryCallingCode(country).length;
    const cleanDigits = digits.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxDigits);
    onChange(`+${getCountryCallingCode(country)}${cleanDigits}`);
  };

  const selectCountry = (country: CountryCode) => {
    setSelectedCountry(country);
    updateNumber(country, localNumber);
    setSearch('');
    setOpen(false);
  };

  return (
    <div className={cn('flex', className)}>
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setSearch('');
      }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Select country calling code"
            aria-expanded={open}
            className="flex h-10 min-w-[7rem] items-center justify-between gap-2 rounded-l-md border border-r-0 border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span>{countryFlag(selectedCountry)} {callingCode}</span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] p-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search country or code..."
              aria-label="Search countries"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredCountries.length ? filteredCountries.map(({ country, name, callingCode: code }) => (
              <button
                key={country}
                type="button"
                onClick={() => selectCountry(country)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
              >
                <Check className={cn('h-4 w-4 shrink-0', selectedCountry === country ? 'opacity-100' : 'opacity-0')} />
                <span className="text-base">{countryFlag(country)}</span>
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <span className="text-muted-foreground">{code}</span>
              </button>
            )) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No country found.</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="77 123 4567"
        value={localNumber}
        onChange={(event) => updateNumber(selectedCountry, event.target.value)}
        pattern={`[0-9]{4,${maxLocalLength}}`}
        minLength={4}
        maxLength={maxLocalLength}
        required={required}
        title="Enter a valid number using digits only"
        className="rounded-l-none"
      />
    </div>
  );
}
