import { toast } from "sonner";

/**
 * Wrapper around Sonner's toast API for consistent notification usage.
 * Provides showNotification with the same ergonomic API as before.
 */
export function useNotifications() {
  return {
    showNotification: (
      message: string,
      type: "info" | "warning" | "error" = "info",
      duration: "short" | "long" | "permanent" = "short",
    ) => {
      const durationMs =
        duration === "short" ? 3000 : duration === "long" ? 6000 : Infinity;

      switch (type) {
        case "error":
          toast.error(message, { duration: durationMs });
          break;
        case "warning":
          toast.warning(message, { duration: durationMs });
          break;
        default:
          toast.success(message, { duration: durationMs });
          break;
      }
    },
  };
}
