"use client";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url";
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  testId?: string;
}

export default function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  helperText,
  onBlur,
  disabled = false,
  testId,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-normal text-fg-strong">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        data-testid={testId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal disabled:opacity-60 disabled:cursor-not-allowed"
      />
      {helperText && <p className="text-sm text-fg-muted">{helperText}</p>}
    </div>
  );
}
