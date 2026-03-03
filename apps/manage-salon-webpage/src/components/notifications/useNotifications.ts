import { create } from "zustand";
import {
  Notification,
  NotificationDuration,
  NotificationType,
} from "./notification.types";

interface NotificationState {
  notifications: Notification[];
  showNotification: (
    message: string,
    type?: NotificationType,
    duration?: NotificationDuration,
  ) => void;
  hideNotification: (id: string) => void;
}

const DURATION_MS: Record<NotificationDuration, number | null> = {
  short: 3000,
  long: 6000,
  permanent: null,
};

export const useNotifications = create<NotificationState>((set) => ({
  notifications: [],

  showNotification: (
    message: string,
    type: NotificationType = "info",
    duration: NotificationDuration = "short",
  ) => {
    const id = crypto.randomUUID();
    const notification: Notification = { id, type, message, duration };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    const ms = DURATION_MS[duration];
    if (ms !== null) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, ms);
    }
  },

  hideNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
