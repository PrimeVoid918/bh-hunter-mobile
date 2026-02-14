import { View, Text } from "react-native";
import React from "react";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { Button } from "@gluestack-ui/themed";

interface BookingPaymentBlockInterface {
  booking: GetBooking;
  viewerRole: "TENANT" | "OWNER";

  // onUploadProof?: () => void;
  // onVerifyPayment?: () => void;

  onPayNow?: () => void; // <-- new PayMongo handler
}

export default function BookingPaymentBlock({
  booking,
  viewerRole,
  // onUploadProof,
  // onVerifyPayment,
  onPayNow,
}: BookingPaymentBlockInterface) {
  const { status, totalAmount, currency, paymentProofId } = booking;

  const isTenant = viewerRole === "TENANT";
  const isOwner = viewerRole === "OWNER";

  // Payment not relevant yet
  if (status === "PENDING_REQUEST") return null;

  return (
    <View>
      {/* PAYMENT SUMMARY */}
      {totalAmount && (
        <Text>
          Amount: {totalAmount} {currency ?? ""}
        </Text>
      )}

      {/* TENANT ACTIONS */}
      {isTenant && status === "AWAITING_PAYMENT" && (
        <>
          <Text>Advance payment required</Text>

          {/* Existing: upload proof */}
          {/* {onUploadProof && (
            <Button onPress={onUploadProof}>
              <Text>Upload Payment Proof</Text>
            </Button>
          )} */}

          {/* New: PayMongo checkout */}
          {onPayNow && (
            <Button onPress={onPayNow}>
              <Text>Pay Now</Text>
            </Button>
          )}
        </>
      )}

      {isTenant && status === "PAYMENT_APPROVAL" && (
        <Text>Waiting for owner to verify payment</Text>
      )}

      {/* OWNER ACTION */}
      {/* {isOwner && status === "PAYMENT_APPROVAL" && (
        <>
          <Text>Payment proof submitted</Text>
          {onVerifyPayment && (
            <Button onPress={onVerifyPayment}>
              <Text>Verify Payment</Text>
            </Button>
          )}
        </>
      )} */}

      {/* COMPLETED */}
      {status === "COMPLETED_BOOKING" && <Text>Payment completed</Text>}

      {/* TERMINAL */}
      {(status === "CANCELLED_BOOKING" || status === "REJECTED_BOOKING") && (
        <Text>Payment cancelled</Text>
      )}

      {/* DEBUG / OPTIONAL */}
      {/* {paymentProofId && <Text>Payment proof attached</Text>} */}
    </View>
  );
}
