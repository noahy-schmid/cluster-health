"use client";

import { Toaster } from "sonner";

/**
 * Custom-styled Sonner Toaster using the app's Tailwind theme tokens.
 */
export default function NotificationContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className:
          "!bg-bg-1 !border !border-border !text-fg-normal !rounded-lg !shadow-md !font-normal !text-sm",
        classNames: {
          error: "!bg-bg-error-1 !border-red-400 !text-fg-error",
          warning: "!bg-yellow-50 !border-yellow-400 !text-yellow-800",
          success: "!bg-bg-2 !border-primary-300 !text-fg-normal",
        },
      }}
    />
  );
}
