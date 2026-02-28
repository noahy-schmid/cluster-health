import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { act } from "@testing-library/react";
import {
  useNotificationStore,
  getSortedNotifications,
} from "./useNotifications";
import { Notification } from "./notification.types";

describe("useNotificationStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useNotificationStore.setState({ notifications: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start with an empty notification list", () => {
    const { notifications } = useNotificationStore.getState();
    expect(notifications).toEqual([]);
  });

  it("should add a notification via showNotification", () => {
    const { showNotification } = useNotificationStore.getState();

    const handle = showNotification({
      type: "info",
      title: "Test",
      content: "Test content",
    });

    const { notifications } = useNotificationStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0]!.id).toBe(handle);
    expect(notifications[0]!.title).toBe("Test");
    expect(notifications[0]!.content).toBe("Test content");
    expect(notifications[0]!.type).toBe("info");
  });

  it("should return a unique handle for each notification", () => {
    const { showNotification } = useNotificationStore.getState();

    const handle1 = showNotification({
      type: "info",
      title: "First",
      content: "First",
    });
    const handle2 = showNotification({
      type: "info",
      title: "Second",
      content: "Second",
    });

    expect(handle1).not.toBe(handle2);
    expect(useNotificationStore.getState().notifications).toHaveLength(2);
  });

  it("should remove a notification via hideNotification", () => {
    const { showNotification } = useNotificationStore.getState();

    const handle = showNotification({
      type: "error",
      title: "Error",
      content: "Something failed",
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    useNotificationStore.getState().hideNotification(handle);

    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it("should default duration to 'short' when not specified", () => {
    const { showNotification } = useNotificationStore.getState();

    showNotification({
      type: "info",
      title: "Default duration",
      content: "Content",
    });

    const { notifications } = useNotificationStore.getState();
    expect(notifications[0]!.duration).toBe("short");
  });

  it("should default dismissable to true when not specified", () => {
    const { showNotification } = useNotificationStore.getState();

    showNotification({
      type: "info",
      title: "Default dismissable",
      content: "Content",
    });

    const { notifications } = useNotificationStore.getState();
    expect(notifications[0]!.dismissable).toBe(true);
  });

  it("should respect explicit dismissable: false", () => {
    const { showNotification } = useNotificationStore.getState();

    showNotification({
      type: "error",
      title: "Non-dismissable",
      content: "Content",
      dismissable: false,
    });

    const { notifications } = useNotificationStore.getState();
    expect(notifications[0]!.dismissable).toBe(false);
  });

  it("should auto-remove 'short' notifications after 3 seconds", () => {
    const { showNotification } = useNotificationStore.getState();

    showNotification({
      type: "info",
      title: "Short",
      content: "Content",
      duration: "short",
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it("should auto-remove 'long' notifications after 8 seconds", () => {
    const { showNotification } = useNotificationStore.getState();

    showNotification({
      type: "warning",
      title: "Long",
      content: "Content",
      duration: "long",
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(7999);
    });
    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it("should not auto-remove 'permanent' notifications", () => {
    const { showNotification } = useNotificationStore.getState();

    showNotification({
      type: "error",
      title: "Permanent",
      content: "Content",
      duration: "permanent",
    });

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(1);
  });

  it("should handle hiding an already-removed notification gracefully", () => {
    const { showNotification } = useNotificationStore.getState();

    const handle = showNotification({
      type: "info",
      title: "Test",
      content: "Content",
      duration: "short",
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(0);

    // Hiding again should not throw
    useNotificationStore.getState().hideNotification(handle);
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it("should support multiple notifications stacking", () => {
    const { showNotification } = useNotificationStore.getState();

    showNotification({
      type: "info",
      title: "First",
      content: "Content 1",
      duration: "permanent",
    });
    showNotification({
      type: "warning",
      title: "Second",
      content: "Content 2",
      duration: "long",
    });
    showNotification({
      type: "error",
      title: "Third",
      content: "Content 3",
      duration: "short",
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(3);
  });

  it("should only remove the targeted notification when hiding", () => {
    const { showNotification } = useNotificationStore.getState();

    showNotification({
      type: "info",
      title: "Keep",
      content: "Content",
      duration: "permanent",
    });
    const handle2 = showNotification({
      type: "warning",
      title: "Remove",
      content: "Content",
      duration: "permanent",
    });
    showNotification({
      type: "error",
      title: "Keep too",
      content: "Content",
      duration: "permanent",
    });

    useNotificationStore.getState().hideNotification(handle2);

    const { notifications } = useNotificationStore.getState();
    expect(notifications).toHaveLength(2);
    expect(notifications.map((n) => n.title)).toEqual(["Keep", "Keep too"]);
  });
});

describe("getSortedNotifications", () => {
  const makeNotification = (
    overrides: Partial<Notification>,
  ): Notification => ({
    id: "id",
    type: "info",
    title: "Title",
    content: "Content",
    duration: "short",
    dismissable: true,
    createdAt: Date.now(),
    ...overrides,
  });

  it("should return empty array for empty input", () => {
    expect(getSortedNotifications([])).toEqual([]);
  });

  it("should place non-permanent notifications before permanent ones", () => {
    const permanent = makeNotification({
      id: "perm",
      duration: "permanent",
      title: "Permanent",
    });
    const short = makeNotification({
      id: "short",
      duration: "short",
      title: "Short",
    });
    const long = makeNotification({
      id: "long",
      duration: "long",
      title: "Long",
    });

    const sorted = getSortedNotifications([permanent, short, long]);

    expect(sorted[0]!.id).toBe("short");
    expect(sorted[1]!.id).toBe("long");
    expect(sorted[2]!.id).toBe("perm");
  });

  it("should preserve insertion order within the same duration group", () => {
    const a = makeNotification({
      id: "a",
      duration: "short",
      createdAt: 1,
    });
    const b = makeNotification({
      id: "b",
      duration: "short",
      createdAt: 2,
    });
    const c = makeNotification({
      id: "c",
      duration: "short",
      createdAt: 3,
    });

    const sorted = getSortedNotifications([a, b, c]);
    expect(sorted.map((n) => n.id)).toEqual(["a", "b", "c"]);
  });

  it("should keep permanent notifications at the bottom", () => {
    const notifications = [
      makeNotification({ id: "p1", duration: "permanent" }),
      makeNotification({ id: "s1", duration: "short" }),
      makeNotification({ id: "p2", duration: "permanent" }),
      makeNotification({ id: "l1", duration: "long" }),
    ];

    const sorted = getSortedNotifications(notifications);

    expect(sorted.map((n) => n.id)).toEqual(["s1", "l1", "p1", "p2"]);
  });

  it("should handle all permanent notifications", () => {
    const notifications = [
      makeNotification({ id: "p1", duration: "permanent" }),
      makeNotification({ id: "p2", duration: "permanent" }),
    ];

    const sorted = getSortedNotifications(notifications);
    expect(sorted.map((n) => n.id)).toEqual(["p1", "p2"]);
  });

  it("should handle all non-permanent notifications", () => {
    const notifications = [
      makeNotification({ id: "s1", duration: "short" }),
      makeNotification({ id: "l1", duration: "long" }),
    ];

    const sorted = getSortedNotifications(notifications);
    expect(sorted.map((n) => n.id)).toEqual(["s1", "l1"]);
  });
});
