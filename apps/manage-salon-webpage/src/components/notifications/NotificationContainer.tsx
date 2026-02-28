"use client";

import {
  useNotificationStore,
  getSortedNotifications,
} from "./useNotifications";
import NotificationItem from "./NotificationItem";

export default function NotificationContainer() {
  const notifications = useNotificationStore((state) => state.notifications);
  const sorted = getSortedNotifications(notifications);

  if (sorted.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="
        fixed z-[100] flex flex-col gap-sm pointer-events-none
        bottom-0 left-0 right-0 p-md
        md:bottom-md md:right-md md:left-auto md:w-96
      "
    >
      {sorted.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem notification={notification} />
        </div>
      ))}
    </div>
  );
}
