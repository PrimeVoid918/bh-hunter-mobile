import { navigationRef } from "@/application/navigation/navigationRef";
import {
  GetNotification,
  NotificationType,
} from "@/infrastructure/notifications/notifications.schema";

export function handleNotificationRedirect(notification: GetNotification) {
  if (!navigationRef.isReady()) return;

  const { type, entityType, data, recipientRole } = notification;

  // Tenant vs Owner
  if (recipientRole === "TENANT") {
    if (type.startsWith("VERIFICATION_")) verificationRoute(type);
    if (type.startsWith("ACCOUNT_")) verificationRoute(type);

    if (type.startsWith("BOOKING_")) bookingRoute(type, notification);
  } else if (recipientRole === "OWNER") {
    if (type.startsWith("VERIFICATION_")) verificationRoute(type);
    if (type.startsWith("ACCOUNT_")) verificationRoute(type);

    if (type.startsWith("BOOKING_")) {
      navigationRef.navigate("Booking" as any, {
        screen: "BookingStatusScreen",
        params: { bookId: notification.data.bookingId! },
      });
    }
  }
}

export const verificationRoute = (route: string) => {
  console.log("Test");
  navigationRef.navigate("Dashboard" as any, {
    screen: "VerificationMainScreen" as any,
  });
};

export const bookingRoute = (route: string, notification: GetNotification) => {
  navigationRef.navigate("Dashboard" as any, {
    screen: "DashboardBookingStack", // first level inside DashboardStack
    params: {
      screen: "DashboardBookingStatusScreen", // second level inside DashboardBookingStack
      params: { bookId: notification.data.bookId! }, // payload for your screen
    },
  });
};
