"use client";

interface FormToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  helperText?: string;
}

export default function FormToggle({
  label,
  value,
  onChange,
  onLabel = "An",
  offLabel = "Aus",
  helperText,
}: FormToggleProps) {
  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-normal text-fg-strong">{label}</label>

      <div className="flex items-center gap-md">
        {/* Off Label */}
        <span
          className={`text-sm ${
            !value ? "text-fg-strong font-focus" : "text-fg-muted"
          }`}
        >
          {offLabel}
        </span>

        {/* Toggle Button */}
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            border border-border
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 
            ${value ? "bg-primary" : "bg-bg-0"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-bg-2 shadow-sm
              transition-transform duration-200
              ${value ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>

        {/* On Label */}
        <span
          className={`text-sm ${
            value ? "text-fg-strong font-focus" : "text-fg-muted"
          }`}
        >
          {onLabel}
        </span>
      </div>

      {helperText && <p className="text-sm text-fg-muted">{helperText}</p>}
    </div>
  );
}
