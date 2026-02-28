import { create } from "zustand";
import {
  Notification,
  NotificationHandle,
  NotificationOptions,
} from "./notification.types";

const DURATION_MS = {
  short: 3000,
  long: 8000,
  permanent: Infinity,
} as const;

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  showNotification: (options: NotificationOptions) => NotificationHandle;
  hideNotification: (handle: NotificationHandle) => void;
}

let counter = 0;

export const useNotificationStore = create<
  NotificationState & NotificationActions
>()((set, get) => ({
  notifications: [],

  showNotification: (options) => {
    const id = `notification-${++counter}-${Date.now()}`;
    const duration = options.duration ?? "short";
    const notification: Notification = {
      ...options,
      id,
      duration,
      dismissable: options.dismissable ?? true,
      createdAt: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    if (duration !== "permanent") {
      setTimeout(() => {
        const current = get().notifications;
        if (current.some((n) => n.id === id)) {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        }
      }, DURATION_MS[duration]);
    }

    return id;
  },

  hideNotification: (handle) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== handle),
    }));
  },
}));

/**
 * Hook providing showNotification and hideNotification functions.
 */
export function useNotifications() {
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );
  const hideNotification = useNotificationStore(
    (state) => state.hideNotification,
  );

  return { showNotification, hideNotification };
}

/**
 * Returns sorted notifications: non-permanent first (oldest at top),
 * then permanent ones at the bottom.
 */
export function getSortedNotifications(
  notifications: Notification[],
): Notification[] {
  const nonPermanent = notifications.filter((n) => n.duration !== "permanent");
  const permanent = notifications.filter((n) => n.duration === "permanent");
  return [...nonPermanent, ...permanent];
}
