"use client";

import { useEffect, useState } from "react";
import {
  XIcon,
  InfoIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Notification } from "./notification.types";
import { useNotificationStore } from "./useNotifications";

const typeStyles: Record<
  Notification["type"],
  { container: string; icon: string }
> = {
  info: {
    container: "border-primary-400 bg-bg-1",
    icon: "text-primary-500",
  },
  warning: {
    container: "border-yellow-400 bg-yellow-50",
    icon: "text-yellow-500",
  },
  error: {
    container: "border-fg-error bg-bg-error-1",
    icon: "text-fg-error",
  },
};

const typeIcons: Record<Notification["type"], typeof InfoIcon> = {
  info: InfoIcon,
  warning: AlertTriangleIcon,
  error: AlertCircleIcon,
};

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const hideNotification = useNotificationStore(
    (state) => state.hideNotification,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => hideNotification(notification.id), 300);
  };

  const style = typeStyles[notification.type];
  const Icon = typeIcons[notification.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-sm p-md rounded-lg border shadow-md
        transition-all duration-300 ease-in-out
        ${style.container}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${style.icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-focus text-fg-strong">
          {notification.title}
        </p>
        <p className="text-xs text-fg-muted mt-0.5">{notification.content}</p>
      </div>
      {notification.dismissable && (
        <button
          onClick={handleDismiss}
          className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-fast"
          aria-label="Dismiss notification"
        >
          <XIcon className="w-4 h-4 text-fg-muted" />
        </button>
      )}
    </div>
  );
}
