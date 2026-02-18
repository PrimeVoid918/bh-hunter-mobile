import { NotificationType } from "@/infrastructure/notifications/notifications.schema";

export interface NotificationConfigItem {
  label: string;
  color: string;
  description: string;
  icon?: string; // optional Ionicons name
}

export const notificationConfig: Record<string, NotificationConfigItem> = {
  // Booking
  BOOKING_REQUESTED: {
    label: "Booking Requested",
    color: "#EAB308",
    description: "A new booking request was submitted",
    icon: "bookmark",
  },
  BOOKING_APPROVED: {
    label: "Booking Approved",
    color: "#199d49",
    description: "Your booking has been approved",
    icon: "checkmark-circle",
  },
  BOOKING_REJECTED: {
    label: "Booking Rejected",
    color: "#EF4444",
    description: "Your booking request was rejected",
    icon: "close-circle",
  },
  BOOKING_CANCELLED: {
    label: "Booking Cancelled",
    color: "#EF4444",
    description: "Booking has been cancelled",
    icon: "close",
  },
  BOOKING_COMPLETED: {
    label: "Booking Completed",
    color: "#16A34A",
    description: "Booking process finished",
    icon: "checkbox",
  },

  // Verification - Document-level
  VERIFICATION_DOCUMENT_APPROVED: {
    label: "Document Verified",
    color: "#1ca64e",
    description: "Your verification document has been approved",
    icon: "checkmark-circle",
  },
  VERIFICATION_DOCUMENT_REJECTED: {
    label: "Document Rejected",
    color: "#EF4444",
    description: "Your verification document has been rejected",
    icon: "close-circle",
  },

  // Verification - Account-level
  ACCOUNT_SETUP_REQUIRED: {
    label: "Complete Account Setup",
    color: "#be7a03",
    description: "Complete your account setup to unlock full access",
    icon: "person-circle",
  },
  ACCOUNT_FULLY_VERIFIED: {
    label: "Account Fully Verified",
    color: "#1dad52",
    description: "Your account has been fully verified",
    icon: "shield-checkmark",
  },

  // Property / Room updates
  BOARDING_HOUSE_UPDATED: {
    label: "Boarding House Updated",
    color: "#3B82F6",
    description: "Boarding house information updated",
    icon: "home-outline",
  },
  BOARDING_AVAILABILITY_CHANGED: {
    label: "Availability Changed",
    color: "#3B82F6",
    description: "Boarding availability updated",
    icon: "calendar-outline",
  },
  ROOM_UPDATED: {
    label: "Room Updated",
    color: "#3B82F6",
    description: "Room information updated",
    icon: "bed-outline",
  },
  ROOM_AVAILABILITY_CHANGED: {
    label: "Room Availability Changed",
    color: "#3B82F6",
    description: "Room availability updated",
    icon: "calendar-outline",
  },

  // System
  SYSTEM: {
    label: "System Notification",
    color: "#94A3B8",
    description: "System generated notification",
    icon: "information-circle-outline",
  },
};
