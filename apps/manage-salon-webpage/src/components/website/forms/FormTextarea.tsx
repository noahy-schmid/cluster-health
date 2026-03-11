"use client";

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  testId?: string;
}

export default function FormTextarea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  required = false,
  testId,
}: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-normal text-fg-strong">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal resize-vertical"
      />
    </div>
  );
}
