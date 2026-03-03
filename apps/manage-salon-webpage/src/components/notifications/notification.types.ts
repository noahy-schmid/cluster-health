export type NotificationType = "info" | "warning" | "error";

export type NotificationDuration = "short" | "long" | "permanent";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: NotificationDuration;
}
