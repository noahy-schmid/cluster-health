"use client";

interface FormFieldProps {
  label: string;
  type: "text" | "email" | "tel" | "date" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export default function FormField({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  helperText,
  disabled = false,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-fg font-semibold mb-2">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-2 border-fg/20 focus:border-fg outline-none transition bg-bg-layer-1 rounded-lg text-lg p-3 focus:outline-fg text-fg w-full mb-2 inset-shadow-xs inset-shadow-black/20"
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {helperText && <p className="text-fg/60 text-sm mt-1">{helperText}</p>}
    </div>
  );
}
