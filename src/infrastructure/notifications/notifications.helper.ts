import { GetNotification, ResourceType } from "./notifications.schema";

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
export const getRoomNotificationData = (
  notification: GetNotification,
): RoomNotificationData | null => {
  if (!notification.data) return null;
  if (ROOM_EVENTS.includes(notification.type as RoomEventType)) {
    return notification.data as RoomNotificationData;
  }
  return null;
};
