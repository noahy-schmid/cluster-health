export type NotificationType = "info" | "warning" | "error";

export type NotificationDuration = "short" | "long" | "permanent";

export interface NotificationOptions {
  type: NotificationType;
  title: string;
  content: string;
  duration?: NotificationDuration;
  dismissable?: boolean;
}

export interface Notification extends NotificationOptions {
  id: string;
  createdAt: number;
}

export type NotificationHandle = string;
