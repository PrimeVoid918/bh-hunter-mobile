import React from "react";
import { View, StyleSheet } from "react-native";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { formatNumberWithCommas } from "@/infrastructure/utils/string.formatter.util";
import {
  Button,
  Surface,
  Text,
  Icon,
  useTheme,
  ActivityIndicator,
  TouchableRipple,
} from "react-native-paper";
import { Spacing } from "@/constants";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { HStack, VStack } from "@gluestack-ui/themed";

interface BookingPaymentBlockInterface {
  booking: GetBooking;
  viewerRole: "TENANT" | "OWNER";
  onPayNow?: () => void;
  isLoading?: boolean;
}

export default function BookingPaymentBlock({
  booking,
  viewerRole,
  onPayNow,
  isLoading = false,
}: BookingPaymentBlockInterface) {
  const { status, totalAmount, currency, room } = booking;
  const theme = useTheme();
  const isTenant = viewerRole === "TENANT";

  const displayPrice = totalAmount ? totalAmount : room.price;

  const handlePayPress = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    onPayNow?.();
  };

  if (status === "PENDING_REQUEST") return null;

  return (
    <Surface
      elevation={0}
      style={[s.container, { borderColor: theme.colors.outlineVariant }]}
    >
      <View style={s.content}>
        {/* Header Section */}
        <View style={s.headerRow}>
          <View>
            <Text variant="labelMedium" style={s.label}>
              Payment Amount
            </Text>
            <Text variant="headlineSmall" style={s.amount}>
              {currency ?? "PHP"} {formatNumberWithCommas(displayPrice)}
            </Text>
          </View>
          {status === "PAYMENT_APPROVAL" && (
            <ActivityIndicator
              animating={true}
              size="small"
              color={theme.colors.primary}
            />
          )}
        </View>

        {/* Tenant Specific Actions */}
        {isTenant && (
          <View style={s.actionGap}>
            {status === "AWAITING_PAYMENT" && (
              <>
                <View style={s.infoRow}>
                  <Icon
                    source="information-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodyMedium" style={s.infoText}>
                    Advance payment required to secure booking.
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={handlePayPress}
                  icon="credit-card-outline"
                  contentStyle={s.buttonHeight}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Pay Now
                </Button>
              </>
            )}

            {status === "PAYMENT_FAILED" && (
              <View
                style={[
                  s.errorBox,
                  { backgroundColor: theme.colors.errorContainer },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.error,
                    fontFamily: "Poppins-Medium",
                  }}
                >
                  Payment failed. Please try again.
                </Text>
                <Button
                  mode="contained"
                  onPress={handlePayPress}
                  buttonColor={theme.colors.error}
                  style={{ marginTop: 8 }}
                  loading={isLoading}
                >
                  Retry Payment
                </Button>
              </View>
            )}

            {status === "PAYMENT_APPROVAL" && (
              <View style={s.infoRow}>
                <Icon
                  source="clock-outline"
                  size={20}
                  color={theme.colors.secondary}
                />
                <Text
                  variant="bodyMedium"
                  style={[s.infoText, { color: theme.colors.onSurfaceVariant }]}
                >
                  Waiting for owner to verify payment...
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ marginTop: 4 }}>
          {status === "COMPLETED_BOOKING" && (
            <View style={s.infoRow}>
              <Icon
                source="check-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text
                variant="bodyMedium"
                style={[
                  s.infoText,
                  {
                    color: theme.colors.success,
                    fontFamily: "Poppins-SemiBold",
                  },
                ]}
              >
                Payment completed successfully
              </Text>
            </View>
          )}

          {status === "CANCELLED_BOOKING" && (
            <View style={s.infoRow}>
              <Icon
                source="close-circle-outline"
                size={20}
                color={theme.colors.outline}
              />
              <Text
                variant="bodyMedium"
                style={[s.infoText, { color: theme.colors.outline }]}
              >
                {isTenant
                  ? "You cancelled this booking request."
                  : "The tenant cancelled this request."}
              </Text>
            </View>
          )}

          {status === "REJECTED_BOOKING" && (
            <View
              style={[
                s.errorBox,
                {
                  backgroundColor: theme.colors.errorContainer,
                  borderColor: "transparent",
                },
              ]}
            >
              <HStack space="sm" alignItems="center">
                <Icon
                  source="alert-octagon"
                  size={20}
                  color={theme.colors.error}
                />
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.error,
                    fontFamily: "Poppins-SemiBold",
                    flex: 1,
                  }}
                >
                  Request Declined
                </Text>
              </HStack>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.error, marginTop: 4 }}
              >
                The owner was unable to accept your booking at this time.
              </Text>
            </View>
          )}

          {booking.paymentStatus === "REFUNDED" && (
            <View
              style={[
                s.infoRow,
                {
                  backgroundColor: theme.colors.primaryContainer,
                  padding: 12,
                  borderRadius: 8,
                },
              ]}
            >
              <Icon
                source="cash-refund"
                size={20}
                color={theme.colors.primary}
              />
              <VStack style={{ flex: 1, marginLeft: 8 }}>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.primary,
                    fontFamily: "Poppins-SemiBold",
                  }}
                >
                  Payment Refunded
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.primary }}
                >
                  The amount has been credited back to your original payment
                  method.
                </Text>
              </VStack>
            </View>
          )}
        </View>
      </View>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  content: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontFamily: "Poppins-Medium",
    color: "#767474",
  },
  amount: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
  },
  actionGap: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  buttonHeight: {
    height: 48,
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(214, 69, 69, 0.2)",
  },
  cancelledText: {
    fontFamily: "Poppins-Medium",
    color: "#D64545",
    fontStyle: "italic",
  },
});
