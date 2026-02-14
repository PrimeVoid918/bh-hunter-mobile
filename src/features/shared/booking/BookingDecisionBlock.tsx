import { View, Text } from "react-native";
import React from "react";
import { UserRole } from "@/infrastructure/user/user.types";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { Button } from "@gluestack-ui/themed";
import { TextInput } from "react-native-gesture-handler";

interface BookingDecisionBlockInterface {
  booking: GetBooking;
  viewerRole: "TENANT" | "OWNER";

  onApprove: (reason: string) => void;
  onReject: (reason: string) => void;
  onCancel: (reason: string) => void;
  onUploadProof?: () => void;
  onVerifyPayment?: () => void;
}

export default function BookingDecisionBlock({
  booking,
  viewerRole,
  onApprove,
  onReject,
  onUploadProof,
  onCancel,
  onVerifyPayment,
}: BookingDecisionBlockInterface) {
  const { status } = booking;

  const isOwner = viewerRole === "OWNER";
  const isTenant = viewerRole === "TENANT";

  const [rejectReason, setRejectReason] = React.useState("");
  const [cancelMessage, setCancelMessage] = React.useState("");

  return (
    <View>
      {/* STATUS TEXT */}
      <Text>Status: {status}</Text>

      {/* OWNER ACTIONS */}
      {isOwner && status === "PENDING_REQUEST" && (
        <>
          <Button onPress={() => onApprove(rejectReason)}>
            <Text>Approve Booking</Text>
          </Button>

          <TextInput
            placeholder="Enter reason"
            value={rejectReason}
            onChangeText={setRejectReason}
            style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
          />

          <Button onPress={() => onReject(rejectReason)}>
            <Text>Reject Booking</Text>
          </Button>
        </>
      )}

      {isOwner && status === "PAYMENT_APPROVAL" && (
        <Button onPress={onVerifyPayment}>
          <Text>Verify Payment</Text>
        </Button>
      )}

      {/* TENANT ACTIONS */}
      {/* {isTenant && status === "AWAITING_PAYMENT" && (
        <Button onPress={onUploadProof}>
          <Text>Upload Payment Proof</Text>
        </Button>
      )} */}

      {isTenant && status === "PENDING_REQUEST" && (
        <>
          <TextInput
            placeholder="Enter reason for cancellation"
            value={cancelMessage}
            onChangeText={setCancelMessage}
            style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
          />

          <Button onPress={() => onCancel(cancelMessage)}>
            <Text>Cancel Booking</Text>
          </Button>
        </>
      )}

      {/* TERMINAL STATES */}
      {(status === "CANCELLED_BOOKING" || status === "REJECTED_BOOKING") && (
        <Text>Booking closed.</Text>
      )}

      {status === "COMPLETED_BOOKING" && (
        <Text>Booking completed successfully.</Text>
      )}
    </View>
  );
}
