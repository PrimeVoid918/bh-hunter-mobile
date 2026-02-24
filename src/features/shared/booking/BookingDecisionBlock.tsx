import React from "react";
import { View, StyleSheet, Vibration } from "react-native";
import {
  Text,
  Surface,
  Button,
  TextInput,
  useTheme,
  HelperText,
} from "react-native-paper";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { Spacing } from "@/constants";
import { VStack, HStack } from "@gluestack-ui/themed";

interface BookingDecisionBlockInterface {
  booking: GetBooking;
  viewerRole: "TENANT" | "OWNER";
  onApprove: (message: string) => void;
  onReject: (reason: string) => void;
  onCancel: (reason: string) => void;
  onVerifyPayment?: () => void;
}

export default function BookingDecisionBlock({
  booking,
  viewerRole,
  onApprove,
  onReject,
  onCancel,
  onVerifyPayment,
}: BookingDecisionBlockInterface) {
  const theme = useTheme();
  const { status } = booking;

  const isOwner = viewerRole === "OWNER";
  const isTenant = viewerRole === "TENANT";

  const [message, setMessage] = React.useState("");

  const handlePress = (action: () => void) => {
    Vibration.vibrate(10);
    action();
  };

  // 1. OWNER: Handle Pending Request
  if (isOwner && status === "PENDING_REQUEST") {
    return (
      <VStack space="md">
        <TextInput
          mode="outlined"
          label="Note to Tenant (Optional)"
          placeholder="e.g. Please bring a valid ID"
          value={message}
          onChangeText={setMessage}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
          style={s.input}
        />
        <HStack space="sm">
          <Button
            mode="contained"
            onPress={() => handlePress(() => onApprove(message))}
            style={s.flexButton}
            contentStyle={s.buttonHeight}
            labelStyle={s.buttonLabel}
          >
            Approve
          </Button>
          <Button
            mode="outlined"
            onPress={() => handlePress(() => onReject(message))}
            textColor={theme.colors.error}
            style={[s.flexButton, { borderColor: theme.colors.error }]}
            contentStyle={s.buttonHeight}
            labelStyle={s.buttonLabel}
          >
            Reject
          </Button>
        </HStack>
      </VStack>
    );
  }

  // 2. OWNER: Verify Payment
  if (isOwner && status === "PAYMENT_APPROVAL") {
    return (
      <Button
        mode="contained-tonal"
        icon="shield-check"
        onPress={() => handlePress(onVerifyPayment!)}
        contentStyle={s.buttonHeight}
        labelStyle={s.buttonLabel}
      >
        Verify Received Payment
      </Button>
    );
  }

  // 3. TENANT: Cancel Booking
  if (
    isTenant &&
    (status === "PENDING_REQUEST" || status === "AWAITING_PAYMENT")
  ) {
    return (
      <VStack space="sm">
        <TextInput
          mode="outlined"
          label="Reason for Cancellation"
          value={message}
          onChangeText={setMessage}
          error={false}
          outlineColor={theme.colors.outlineVariant}
          style={s.input}
        />
        <Button
          mode="text"
          onPress={() => handlePress(() => onCancel(message))}
          textColor={theme.colors.error}
          labelStyle={s.buttonLabel}
        >
          Cancel Reservation
        </Button>
      </VStack>
    );
  }

  return null;
}

const s = StyleSheet.create({
  input: {
    backgroundColor: "white",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  flexButton: {
    flex: 1,
    borderRadius: 8, // md per tokens
  },
  buttonHeight: {
    height: 48,
  },
  buttonLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
