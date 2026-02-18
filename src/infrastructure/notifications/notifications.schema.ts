import { z } from "zod";

/* =========================================================
   ENUMS
========================================================= */

// UserRole enum (mirror backend)
export const UserRoleEnum = z.enum(["TENANT", "OWNER", "ADMIN"]);

// ResourceType enum (mirror backend)
export const ResourceTypeEnum = z.enum([
  "TENANT",
  "OWNER",
  "ADMIN",
  "BOARDING_HOUSE",
  "ROOM",
  "BOOKING",
  "SUBSCRIPTION",
]);

// TypeScript type
export type ResourceType = z.infer<typeof ResourceTypeEnum>; // "TENANT" | "OWNER" | ...

// Runtime array of values
export const ResourceTypeValues = ResourceTypeEnum.options;

// NotificationType enum
export const NotificationTypeEnum = z.enum([
  // Booking
  "BOOKING_REQUESTED",
  "BOOKING_APPROVED",
  "BOOKING_REJECTED",
  "PAYMENT_UPLOADED",
  "PAYMENT_APPROVED",
  "BOOKING_CANCELLED",
  "BOOKING_COMPLETED",

  // Verification
  "VERIFICATION_APPROVED",
  "VERIFICATION_REJECTED",

  // Property
  "BOARDING_HOUSE_UPDATED",
  "BOARDING_AVAILABILITY_CHANGED",
  "ROOM_UPDATED",
  "ROOM_AVAILABILITY_CHANGED",

  // System
  "SYSTEM",
]);

// Channel enum
export const NotificationChannelEnum = z.enum(["IN_APP", "EMAIL", "PUSH"]);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;

/* =========================================================
   Notification Metadata Map
========================================================= */

interface NotificationMetadata {
  label: string;
  color: string;
  description: string;
}

const notificationTypeMap: Record<NotificationType, NotificationMetadata> = {
  BOOKING_REQUESTED: {
    label: "Booking Requested",
    color: "#EAB308",
    description: "A new booking request was submitted",
  },
  BOOKING_APPROVED: {
    label: "Booking Approved",
    color: "#22C55E",
    description: "Your booking has been approved",
  },
  BOOKING_REJECTED: {
    label: "Booking Rejected",
    color: "#EF4444",
    description: "Your booking request was rejected",
  },
  PAYMENT_UPLOADED: {
    label: "Payment Uploaded",
    color: "#F97316",
    description: "Tenant uploaded payment proof",
  },
  PAYMENT_APPROVED: {
    label: "Payment Approved",
    color: "#22C55E",
    description: "Payment has been verified",
  },
  BOOKING_CANCELLED: {
    label: "Booking Cancelled",
    color: "#EF4444",
    description: "Booking has been cancelled",
  },
  BOOKING_COMPLETED: {
    label: "Booking Completed",
    color: "#16A34A",
    description: "Booking process finished",
  },
  VERIFICATION_APPROVED: {
    label: "Verification Approved",
    color: "#22C55E",
    description: "Verification approved",
  },
  VERIFICATION_REJECTED: {
    label: "Verification Rejected",
    color: "#EF4444",
    description: "Verification rejected",
  },
  BOARDING_HOUSE_UPDATED: {
    label: "Boarding House Updated",
    color: "#3B82F6",
    description: "Boarding house information updated",
  },
  BOARDING_AVAILABILITY_CHANGED: {
    label: "Availability Changed",
    color: "#3B82F6",
    description: "Boarding availability updated",
  },
  ROOM_UPDATED: {
    label: "Room Updated",
    color: "#3B82F6",
    description: "Room information updated",
  },
  ROOM_AVAILABILITY_CHANGED: {
    label: "Room Availability Changed",
    color: "#3B82F6",
    description: "Room availability updated",
  },
  SYSTEM: {
    label: "System Notification",
    color: "#94A3B8",
    description: "System generated notification",
  },
};

/**
 * Helper to get notification metadata
 */
export const getNotificationDetails = (
  type: string | NotificationType,
): NotificationMetadata => {
  return (
    notificationTypeMap[type as NotificationType] ?? {
      label: "Unknown",
      color: "#94A3B8",
      description: "Unknown notification",
    }
  );
};

/* =========================================================
   Base Notification Entity
========================================================= */

export const notificationSchema = z.object({
  id: z.number(),
  recipientRole: UserRoleEnum,
  recipientId: z.number(),
  type: NotificationTypeEnum,
  title: z.string(),
  message: z.string(),
  entityType: ResourceTypeEnum,
  entityId: z.number(),

  data: z.any(),

  channel: NotificationChannelEnum,
  isRead: z.boolean(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  isDeleted: z.boolean(),
});

// reuse pattern like booking
export const BaseNotificationSchema = notificationSchema;

/* =========================================================
   Get Notification (for list endpoints)
========================================================= */

export const GetNotificationSchema = BaseNotificationSchema.pick({
  id: true,
  recipientRole: true,
  recipientId: true,
  type: true,
  title: true,
  message: true,
  entityType: true,
  entityId: true,
  data: true,
  channel: true,
  isRead: true,
  readAt: true,
  createdAt: true,
});

export type GetNotification = z.infer<typeof GetNotificationSchema>;

/* =========================================================
   Query Filters
========================================================= */

export const QueryNotificationSchema = z.object({
  userId: z.number(),
  role: UserRoleEnum,
  isRead: z.boolean().optional(),
  type: NotificationTypeEnum.optional(),
  resourceType: ResourceTypeEnum.optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

export type QueryNotification = z.infer<typeof QueryNotificationSchema>;

/* =========================================================
   Patch - Mark as Read (Query Params)
========================================================= */

export const PatchMarkAsReadSchema = z.object({
  userId: z.number(),
  role: UserRoleEnum,
});

export type PatchMarkAsReadInput = z.infer<typeof PatchMarkAsReadSchema>;
