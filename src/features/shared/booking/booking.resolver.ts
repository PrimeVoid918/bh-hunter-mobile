import { BookingPermissions } from "./booking.type";

export function getBookingPermissions(
  role: "TENANT" | "OWNER",
  status: string,
): BookingPermissions {
  if (role === "OWNER") {
    return {
      canApprove: status === "PENDING_REQUEST",
      canReject: status === "PENDING_REQUEST",
      canVerifyPayment: status === "PAYMENT_APPROVAL",
      canCancel: false,
      canRequestRefund: false,
    };
  }

  if (role === "TENANT") {
    return {
      canApprove: false,
      canReject: false,
      canVerifyPayment: false,
      canCancel: ["PENDING_REQUEST", "AWAITING_PAYMENT"].includes(status),
      canRequestRefund: status === "COMPLETED_BOOKING",
    };
  }

  return {
    canApprove: false,
    canReject: false,
    canCancel: false,
    canRequestRefund: false,
    canVerifyPayment: false,
  };
}
