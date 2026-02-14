const tenantState = {
  isLocked: booking.status === "PAID" || booking.status === "COMPLETED_BOOKING",
  message:
    booking.status === "PENDING_REQUEST"
      ? "Waiting for owner approval"
      : booking.status === "AWAITING_PAYMENT"
        ? "Ready to pay"
        : booking.status === "PAID"
          ? "Payment successful"
          : booking.status === "REJECTED_BOOKING"
            ? "Booking rejected"
            : "",
};
const ownerState = {
  isLocked: booking.status !== "PENDING_REQUEST",
  message:
    booking.status === "PENDING_REQUEST"
      ? "Pending your approval"
      : booking.status === "AWAITING_PAYMENT"
        ? "Waiting for tenant payment"
        : booking.status === "PAID"
          ? "Payment received"
          : booking.status === "REJECTED_BOOKING"
            ? "Booking rejected"
            : "",
};

/**
 Element 1 state

PENDING_REQUEST
REJECTED_BOOKING
AWAITING_PAYMENT

Tenant
PENDING_REQUEST	  “Waiting for owner approval”
REJECTED_BOOKING	"Owner message"
AWAITING_PAYMENT  “Booking accepted”

Owner
PENDING_REQUEST	  Accept / Reject + message
REJECTED_BOOKING	Locked
AWAITING_PAYMENT	Locked


Element 2 state
“Cancelled payment = cancelled booking” => absolute rule

AWAITING_PAYMENT
PAID
CANCELLED_BOOKING

Tenant
AWAITING_PAYMENT	Advance Pay Button + Disclaimer
PAID	            Payment successful
CANCELLED_BOOKING	Booking cancelled

Owner
AWAITING_PAYMENT	Waiting for payment
PAID	            Payment received
CANCELLED_BOOKING	Booking cancelled
 */
