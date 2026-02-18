// notifications.event-payloads.ts
import type { GetNotification, ResourceType } from "./notifications.schema";

/**
 * ---------------------------
 * Domain registry pattern
 * ---------------------------
 */

interface NotificationDomain<DataType> {
  events: readonly string[];
  cast: (notification: GetNotification) => DataType | null;
}

const domainRegistry = new Map<string, NotificationDomain<any>>();

/**
 * ---------------------------
 * Booking Domain
 * ---------------------------
 */

export const BOOKING_EVENTS = [
  "BOOKING_REQUESTED",
  "BOOKING_APPROVED",
  "BOOKING_REJECTED",
  "BOOKING_CANCELLED",
  "BOOKING_COMPLETED",
] as const;

export type BookingEventType = (typeof BOOKING_EVENTS)[number];

export interface BookingNotificationData {
  resourceType: ResourceType; // always BOOKING
  bookingId: number;
  tenantId: number;
  ownerId: number;
  roomId: number;
  bhId: number;
  action: "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
}

/**
 * Register booking domain in the registry
 */
domainRegistry.set("BOOKING", {
  events: BOOKING_EVENTS,
  cast: (notification: GetNotification) => {
    if (!notification.data) return null;
    if (BOOKING_EVENTS.includes(notification.type as BookingEventType)) {
      return notification.data as BookingNotificationData;
    }
    return null;
  },
});

/**
 * ---------------------------
 * ROOM Domain Example
 * ---------------------------
 */

export const ROOM_EVENTS = [
  "ROOM_UPDATED",
  "ROOM_AVAILABILITY_CHANGED",
] as const;
export type RoomEventType = (typeof ROOM_EVENTS)[number];

export interface RoomNotificationData {
  resourceType: ResourceType; // ROOM
  roomId: number;
  bhId: number;
  action: "UPDATED" | "AVAILABILITY_CHANGED";
}

domainRegistry.set("ROOM", {
  events: ROOM_EVENTS,
  cast: (notification: GetNotification) => {
    if (!notification.data) return null;
    if (ROOM_EVENTS.includes(notification.type as RoomEventType)) {
      return notification.data as RoomNotificationData;
    }
    return null;
  },
});

/**
 * ---------------------------
 * Generic helper
 * ---------------------------
 */

export function getNotificationData<T extends string>(
  notification: GetNotification,
  domain: T,
): ReturnType<typeof domainRegistry.get> extends NotificationDomain<infer D>
  ? D | null
  : never {
  const entry = domainRegistry.get(domain);
  if (!entry) return null;
  return entry.cast(notification);
}

/**
 * ---------------------------
 * Usage Example:
 * ---------------------------
 * const notifications = useGetAllQuery({ userId: 1, role: "TENANT" }).data ?? [];
 * const bookingData = getNotificationData(notifications[0], "BOOKING");
 * if (bookingData) console.log(bookingData.bookingId, bookingData.action);
 */
