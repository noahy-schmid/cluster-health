import { useCallback, useRef } from "react";
import { useNotifications } from "@/components/notifications/useNotifications";

/**
 * A hook that provides a debounced auto-save function.
 * Calls onSave after a debounce delay and shows notifications on success/failure.
 */
export function useAutoSave(onSave: () => Promise<void>, debounceMs = 800) {
  const { showNotification } = useNotifications();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isSavingRef = useRef(false);

  const trigger = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isSavingRef.current) return;
    timerRef.current = setTimeout(async () => {
      isSavingRef.current = true;
      try {
        await onSave();
        showNotification("Erfolgreich gespeichert", "info", "short");
      } catch {
        showNotification("Fehler beim Speichern", "error", "long");
      } finally {
        isSavingRef.current = false;
      }
    }, debounceMs);
  }, [onSave, debounceMs, showNotification]);

  return trigger;
}
