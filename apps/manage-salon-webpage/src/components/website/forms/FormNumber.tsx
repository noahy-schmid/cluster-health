"use client";

interface FormNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
  helperText?: string;
}

export default function FormNumber({
  label,
  value,
  onChange,
  onBlur,
  min = 1,
  max = 480,
  required = false,
  helperText,
}: FormNumberProps) {
  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-normal text-fg-strong">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          onChange(isNaN(val) || val < min ? min : val);
        }}
        onBlur={(e) => {
          const val = parseInt(e.target.value, 10);
          onBlur?.(isNaN(val) || val < min ? min : val);
        }}
        className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal w-32"
      />
      {helperText && <p className="text-sm text-fg-muted">{helperText}</p>}
    </div>
  );
}
