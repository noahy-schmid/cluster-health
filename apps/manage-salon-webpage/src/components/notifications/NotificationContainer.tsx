"use client";

import { XIcon, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useNotifications } from "./useNotifications";
import { NotificationType } from "./notification.types";

const iconMap: Record<NotificationType, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const styleMap: Record<NotificationType, string> = {
  info: "bg-bg-2 border-primary-300 text-fg-normal",
  warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
  error: "bg-bg-error-1 border-red-400 text-fg-error",
};

export default function NotificationContainer() {
  const { notifications, hideNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-md right-md z-50 flex flex-col gap-sm max-w-sm">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type];
        return (
          <div
            key={notification.id}
            className={`flex items-start gap-sm p-md border rounded-lg shadow-md ${styleMap[notification.type]}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{notification.message}</p>
            <button
              onClick={() => hideNotification(notification.id)}
              className="flex-shrink-0 cursor-pointer"
              aria-label="Benachrichtigung schließen"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
