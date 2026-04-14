import React from "react";
import { View, StyleSheet, Vibration } from "react-native";
import {
  Text,
  Surface,
  Button,
  TextInput,
  useTheme,
  HelperText,
  Portal,
  Modal,
  Icon,
} from "react-native-paper";
import {
  GetBooking,
  RefundPreview,
} from "@/infrastructure/booking/booking.schema";
import { Spacing } from "@/constants";
import { VStack, HStack, Box } from "@gluestack-ui/themed";

interface BookingDecisionBlockInterface {
  booking: GetBooking;
  viewerRole: "TENANT" | "OWNER";
  onApprove: (message: string) => void;
  onReject: (reason: string) => void;
  onCancel: (reason: string) => void;
  onVerifyPayment?: () => void;
  refundPreview?: RefundPreview | null;
  isRefundLoading?: boolean;
  isLoading?: boolean;
}

export default function BookingDecisionBlock({
  booking,
  viewerRole,
  onApprove,
  onReject,
  onCancel,
  onVerifyPayment,
  refundPreview,
  isLoading,
}: BookingDecisionBlockInterface) {
  const theme = useTheme();
  const { status } = booking;
  const isOwner = viewerRole === "OWNER";
  const isTenant = viewerRole === "TENANT";

  const [message, setMessage] = React.useState("");
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handlePress = (pattern: "light" | "heavy", action: () => void) => {
    Vibration.vibrate(pattern === "heavy" ? 40 : 10);
    action();
  };

  // const isRefundable = status === "COMPLETED_BOOKING" && refundPreview;
  const showRefundUI = status === "COMPLETED_BOOKING" && refundPreview;

  if (isOwner && status === "PENDING_REQUEST") {
    return (
      <VStack
        space="md"
        style={{ opacity: isLoading ? 0.7 : 1 }}
        pointerEvents={isLoading ? "none" : "auto"}
      >
        <TextInput
          mode="outlined"
          label="Note to Tenant (Optional)"
          value={message}
          onChangeText={setMessage}
          outlineColor={theme.colors.outlineVariant}
          style={s.input}
          disabled={isLoading}
        />
        <HStack space="sm">
          <Button
            mode="contained"
            onPress={() => handlePress("light", () => onApprove(message))}
            style={s.flexButton}
            loading={isLoading}
          >
            Approve
          </Button>
          <Button
            mode="outlined"
            onPress={() => handlePress("light", () => onReject(message))}
            textColor={theme.colors.error}
            style={[s.flexButton, { borderColor: theme.colors.error }]}
            disabled={isLoading}
          >
            Reject
          </Button>
        </HStack>
      </VStack>
    );
  }

  if (isOwner && status === "PAYMENT_APPROVAL") {
    return (
      <Button
        mode="contained-tonal"
        icon="shield-check"
        onPress={() => handlePress("light", onVerifyPayment!)}
        contentStyle={s.buttonHeight}
        loading={isLoading}
      >
        Verify Received Payment
      </Button>
    );
  }

  if (
    isTenant &&
    (status === "PENDING_REQUEST" ||
      status === "AWAITING_PAYMENT" ||
      status === "COMPLETED_BOOKING")
  ) {
    return (
      <VStack space="sm" pointerEvents={isLoading ? "none" : "auto"}>
        {showRefundUI && (
          <RefundSummary preview={refundPreview} theme={theme} />
        )}

        <TextInput
          mode="outlined"
          label={
            showRefundUI
              ? "Reason for Refund Request"
              : "Reason for Cancellation"
          }
          placeholder={
            showRefundUI
              ? "Why are you requesting a refund?"
              : "Optional reason..."
          }
          value={message}
          onChangeText={setMessage}
          outlineColor={theme.colors.outlineVariant}
          style={s.input}
          disabled={isLoading}
        />

        <Button
          mode={showRefundUI ? "contained" : "text"}
          onPress={() => setShowConfirm(true)}
          buttonColor={showRefundUI ? theme.colors.error : undefined}
          textColor={!showRefundUI ? theme.colors.error : "#FFF"}
          labelStyle={s.buttonLabel}
          loading={isLoading}
          icon={showRefundUI ? "cash-refund" : "close-circle-outline"}
        >
          {status === "COMPLETED_BOOKING"
            ? "Request Refund"
            : "Cancel Reservation"}
        </Button>

        <Portal>
          <Modal
            visible={showConfirm && !isLoading}
            onDismiss={() => setShowConfirm(false)}
            contentContainerStyle={s.modalContainer}
          >
            <Surface elevation={0} style={s.modalContent}>
              <VStack space="md" alignItems="center">
                <Box
                  style={[
                    s.iconCircle,
                    { backgroundColor: theme.colors.error + "1A" },
                  ]}
                >
                  <Icon
                    source="alert-circle"
                    color={theme.colors.error}
                    size={30}
                  />
                </Box>
                <Text style={s.modalTitle}>Confirm Action</Text>
                <Text style={s.modalSubtitle}>
                  {showRefundUI
                    ? refundPreview.refundable
                      ? `You will be refunded ${refundPreview.currency} ${refundPreview.refundAmount} (${(refundPreview.percentage * 100).toFixed(0)}% of original).`
                      : "This booking is non-refundable. Cancelling now will not return any funds."
                    : "This reservation will be cancelled immediately. This cannot be undone."}
                </Text>
                <VStack space="sm" style={{ width: "100%" }}>
                  <Button
                    mode="contained"
                    buttonColor={theme.colors.error}
                    loading={isLoading}
                    onPress={() =>
                      handlePress("heavy", () => {
                        onCancel(message);
                        setShowConfirm(false);
                      })
                    }
                  >
                    Confirm{" "}
                    {status === "COMPLETED_BOOKING" ? "Refund" : "Cancellation"}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => setShowConfirm(false)}
                    disabled={isLoading}
                  >
                    Go Back
                  </Button>
                </VStack>
              </VStack>
            </Surface>
          </Modal>
        </Portal>
      </VStack>
    );
  }

  return null;
}

const RefundSummary = ({
  preview,
  theme,
}: {
  preview: RefundPreview;
  theme: any;
}) => {
  const isNone =
    !preview.refundable || preview.refundStatus === "NOT_REFUNDABLE";

  return (
    <Surface
      elevation={0}
      style={[
        s.refundCard,
        {
          borderColor: isNone
            ? theme.colors.error + "40"
            : theme.colors.outlineVariant,
          backgroundColor: isNone ? theme.colors.error + "05" : "#F7F9FC",
        },
      ]}
    >
      <VStack space="xs">
        <HStack justifyContent="space-between">
          <Text style={s.refundLabel}>Refund Policy Status</Text>
          <Text
            style={[
              s.refundPercent,
              { color: isNone ? theme.colors.error : theme.colors.success },
            ]}
          >
            {isNone
              ? "NON-REFUNDABLE"
              : `${(preview.percentage * 100).toFixed(0)}% Eligible`}
          </Text>
        </HStack>

        {!isNone && (
          <HStack justifyContent="space-between">
            <Text style={s.refundSub}>Estimated Return</Text>
            <Text style={s.refundAmount}>
              {preview.currency} {preview.refundAmount}
            </Text>
          </HStack>
        )}
      </VStack>
    </Surface>
  );
};

const s = StyleSheet.create({
  input: {
    backgroundColor: "white",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  refundCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  flexButton: { flex: 1, borderRadius: 8 },
  buttonHeight: { height: 48 },
  buttonLabel: { fontFamily: "Poppins-SemiBold", fontSize: 14 },
  refundCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#F7F9FC",
    marginBottom: 8,
  },
  refundLabel: { fontFamily: "Poppins-Medium", fontSize: 12 },
  refundPercent: { fontFamily: "Poppins-Bold", fontSize: 12 },
  refundSub: { fontFamily: "Poppins-Regular", fontSize: 11, color: "#767474" },
  refundAmount: { fontFamily: "Poppins-SemiBold", fontSize: 14 },
  // Modal Styles
  modalContainer: { padding: 20 },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "white",
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    textAlign: "center",
  },
  modalSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
});
