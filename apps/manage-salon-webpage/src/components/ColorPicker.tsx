"use client";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  required?: boolean;
}

export default function ColorPicker({
  label,
  value,
  onChange,
  helperText,
  required = false,
}: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-sm">
      <style>{`
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 0.375rem;
        }
        input[type="color"]::-moz-color-swatch {
          border: none;
          border-radius: 0.375rem;
        }
      `}</style>
      <label className="text-sm font-normal text-fg-strong">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-md">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-md border border-border cursor-pointer bg-bg-0 outline-none focus:outline-none focus:ring-0"
          style={{
            backgroundColor: value,
            WebkitAppearance: "none",
            appearance: "none",
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
      {helperText && <p className="text-sm text-fg-muted">{helperText}</p>}
    </div>
  );
}
