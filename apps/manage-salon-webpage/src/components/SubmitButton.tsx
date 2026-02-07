"use client";

import { useFormStatus } from "react-dom";

export type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
};

/**
 * Shared submit button with pending state text.
 * @param label Button label shown by default.
 * @param pendingLabel Optional label shown while form is pending.
 */
export default function SubmitButton({
  label,
  pendingLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const displayLabel = pending ? (pendingLabel ?? label) : label;

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full px-lg py-sm rounded-md text-base font-focus transition-colors ${
        pending
          ? "bg-primary-300 text-fg-inv cursor-not-allowed"
          : "bg-primary-500 text-fg-inv hover:bg-primary-600"
      }`}
    >
      {displayLabel}
    </button>
  );
}
