"use client";

import { useState, useEffect } from "react";

interface FormMoneyProps {
  label: string;
  value: number;
  onChange: (valueInCents: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
}

function centsToEuros(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseEurosToCents(input: string): number {
  const cleaned = input.replace(/[^\d,]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export default function FormMoney({
  label,
  value,
  onChange,
  min = 0,
  max = 10000000,
  required = false,
  helperText,
  disabled = false,
}: FormMoneyProps) {
  const [inputValue, setInputValue] = useState(centsToEuros(value));

  useEffect(() => {
    setInputValue(centsToEuros(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d,]/g, "");
    setInputValue(rawValue);
  };

  const handleBlur = () => {
    const cents = parseEurosToCents(inputValue);
    const clampedCents = Math.max(min, Math.min(max, cents));
    onChange(clampedCents);
    setInputValue(centsToEuros(clampedCents));
  };

  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-normal text-fg-strong">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative text-start">
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="0,00"
          className="px-md py-sm pr-xl border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal w-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="p-md text-fg-muted font-normal">€</span>
      </div>
      {helperText && <p className="text-sm text-fg-muted">{helperText}</p>}
    </div>
  );
}
