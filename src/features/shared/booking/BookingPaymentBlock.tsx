import React from "react";
import { View, StyleSheet } from "react-native";
import {
  BookingStatusResponse,
  GetBooking,
} from "@/infrastructure/booking/booking.schema";
import { formatNumberWithCommas } from "@/infrastructure/utils/string.formatter.util";
import {
  Button,
  Surface,
  Text,
  Icon,
  useTheme,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { Spacing } from "@/constants";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { HStack, VStack, Box } from "@gluestack-ui/themed";

interface BookingPaymentBlockInterface {
  booking: GetBooking;
  bookingStatus?: BookingStatusResponse | null;
  viewerRole: "TENANT" | "OWNER";
  onPayNow?: () => void;
  isLoading?: boolean;
}

const chargeLabels: Record<string, string> = {
  RESERVATION_FEE: "Reservation Fee",
  ADVANCE_PAYMENT: "Advance Payment",
  DEPOSIT: "Security Deposit",
  EXTENSION_PAYMENT: "Extension Payment",
};

const chargeDescriptions: Record<string, string> = {
  RESERVATION_FEE: "Secures the approved booking slot",
  ADVANCE_PAYMENT: "Pre-check-in stay payment",
  DEPOSIT: "Security deposit before move-in",
  EXTENSION_PAYMENT: "Extends the current checkout date",
};

const chargeIcons: Record<string, string> = {
  RESERVATION_FEE: "bookmark-check-outline",
  ADVANCE_PAYMENT: "cash-multiple",
  DEPOSIT: "shield-home-outline",
  EXTENSION_PAYMENT: "calendar-plus",
};

export default function BookingPaymentBlock({
  booking,
  viewerRole,
  bookingStatus,
  onPayNow,
  isLoading = false,
}: BookingPaymentBlockInterface) {
  const { status, currency, room } = booking;
  const theme = useTheme();
  const isTenant = viewerRole === "TENANT";

  const nextCharge = bookingStatus?.nextPendingCharge ?? null;
  const charges = bookingStatus?.charges ?? [];
  const totals = bookingStatus?.totals ?? {
    totalCharges: 0,
    paidCharges: 0,
    remainingCharges: 0,
  };

  const isCompleted =
    !nextCharge && totals.remainingCharges === 0 && charges.length > 0;
  const displayPrice = nextCharge?.amount ?? room.price;
  const progressText =
    totals.totalCharges > 0
      ? `${totals.paidCharges} of ${totals.totalCharges} charges paid`
      : "Waiting for owner approval";

  const handlePayPress = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    onPayNow?.();
  };

  const getChargeLabel = (type?: string | null) =>
    (type && chargeLabels[type]) || type?.replaceAll("_", " ") || "Charge";

  const getChargeIcon = (type?: string | null) =>
    (type && chargeIcons[type]) || "cash";

  const getChargeDescription = (type?: string | null) =>
    (type && chargeDescriptions[type]) || "Booking-related payment";

  const getChargeStatusMeta = (chargeStatus?: string | null) => {
    switch (chargeStatus) {
      case "PAID":
        return {
          label: "Paid",
          color: theme.colors.success,
          icon: "check-circle",
          bg: theme.colors.success + "12",
        };
      case "REFUNDED":
        return {
          label: "Refunded",
          color: theme.colors.primary,
          icon: "cash-refund",
          bg: theme.colors.primaryContainer,
        };
      case "EXPIRED":
        return {
          label: "Expired",
          color: theme.colors.error,
          icon: "clock-alert-outline",
          bg: theme.colors.errorContainer,
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          color: theme.colors.outline,
          icon: "close-circle-outline",
          bg: theme.colors.surfaceVariant,
        };
      default:
        return {
          label: "Pending",
          color: theme.colors.secondary,
          icon: "clock-outline",
          bg: theme.colors.secondary + "18",
        };
    }
  };

  if (status === "PENDING_REQUEST") return null;

  return (
    <Surface
      elevation={0}
      style={[s.container, { borderColor: theme.colors.outlineVariant }]}
    >
      <View style={s.content}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" style={s.label}>
              {nextCharge ? "Next Payment Amount" : "Booking Payment Status"}
            </Text>
            <Text variant="headlineSmall" style={s.amount}>
              {currency ?? "PHP"} {formatNumberWithCommas(displayPrice)}
            </Text>
            <Text style={s.subtleText}>{progressText}</Text>
          </View>

          {status === "PAYMENT_APPROVAL" && (
            <ActivityIndicator
              animating={true}
              size="small"
              color={theme.colors.primary}
            />
          )}
        </View>

        {isTenant && nextCharge && (
          <Surface
            elevation={0}
            style={[
              s.nextChargeCard,
              {
                borderColor: theme.colors.primary + "35",
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
          >
            <HStack space="sm" alignItems="center">
              <Box
                style={[
                  s.nextChargeIconWrap,
                  { backgroundColor: theme.colors.primary + "18" },
                ]}
              >
                <Icon
                  source={getChargeIcon(nextCharge.type)}
                  size={20}
                  color={theme.colors.primary}
                />
              </Box>

              <VStack style={{ flex: 1 }}>
                <Text style={s.nextChargeTitle}>
                  Next payment: {getChargeLabel(nextCharge.type)}
                </Text>
                <Text style={s.nextChargeSub}>
                  {getChargeDescription(nextCharge.type)}
                </Text>
                {!!nextCharge.dueDate && (
                  <Text style={s.nextChargeDue}>
                    Due:{" "}
                    {new Date(nextCharge.dueDate).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                )}
              </VStack>
            </HStack>

            <Button
              mode="contained"
              onPress={handlePayPress}
              icon="credit-card-outline"
              contentStyle={s.buttonHeight}
              loading={isLoading}
              disabled={isLoading}
              style={s.primaryButton}
            >
              Pay {getChargeLabel(nextCharge.type)}
            </Button>
          </Surface>
        )}

        {charges.length > 0 && (
          <View style={s.sectionBlock}>
            <HStack
              justifyContent="space-between"
              alignItems="center"
              style={s.sectionHeader}
            >
              <Text style={s.sectionTitle}>Payment Schedule</Text>
              <Text style={s.sectionMeta}>
                {totals.remainingCharges} remaining
              </Text>
            </HStack>

            <VStack space="sm">
              {charges.map((charge, index) => {
                const meta = getChargeStatusMeta(charge.status);
                const isCurrent = nextCharge?.id === charge.id;

                return (
                  <Surface
                    key={charge.id}
                    elevation={0}
                    style={[
                      s.chargeRow,
                      {
                        borderColor: isCurrent
                          ? theme.colors.primary
                          : theme.colors.outlineVariant,
                        backgroundColor: isCurrent
                          ? theme.colors.primaryContainer + "55"
                          : theme.colors.surface,
                      },
                    ]}
                  >
                    <HStack space="sm" alignItems="flex-start">
                      <Box
                        style={[s.chargeIconWrap, { backgroundColor: meta.bg }]}
                      >
                        <Icon
                          source={getChargeIcon(charge.type)}
                          size={18}
                          color={meta.color}
                        />
                      </Box>

                      <VStack style={{ flex: 1 }}>
                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text style={s.chargeTitle}>
                            {index + 1}. {getChargeLabel(charge.type)}
                          </Text>

                          <HStack
                            space="xs"
                            alignItems="center"
                            style={[s.statusChip, { backgroundColor: meta.bg }]}
                          >
                            <Icon
                              source={meta.icon}
                              size={14}
                              color={meta.color}
                            />
                            <Text
                              style={[s.statusChipText, { color: meta.color }]}
                            >
                              {meta.label}
                            </Text>
                          </HStack>
                        </HStack>

                        <Text style={s.chargeDesc}>
                          {getChargeDescription(charge.type)}
                        </Text>

                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                          style={s.chargeMetaRow}
                        >
                          <Text style={s.chargeAmount}>
                            {currency ?? "PHP"}{" "}
                            {formatNumberWithCommas(charge.amount)}
                          </Text>

                          {!!charge.dueDate && (
                            <Text style={s.chargeDue}>
                              Due{" "}
                              {new Date(charge.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </Text>
                          )}
                        </HStack>

                        {!!charge.paidAt && (
                          <Text style={s.paidAtText}>
                            Paid on{" "}
                            {new Date(charge.paidAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </Text>
                        )}

                        {isCurrent && (
                          <Text
                            style={[
                              s.currentMarker,
                              { color: theme.colors.primary },
                            ]}
                          >
                            This is the active payment step.
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Surface>
                );
              })}
            </VStack>
          </View>
        )}

        {isCompleted && (
          <View style={[s.infoRow, { marginTop: 12 }]}>
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
              All required booking charges are paid
            </Text>
          </View>
        )}

        {isTenant && (
          <View style={s.actionGap}>
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

        <View style={{ marginTop: 8 }}>
          {status === "COMPLETED_BOOKING" && !nextCharge && (
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
    alignItems: "flex-start",
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
  subtleText: {
    marginTop: 4,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
  },
  actionGap: {
    gap: 12,
    marginTop: 12,
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
  primaryButton: {
    marginTop: 12,
    borderRadius: 10,
  },
  nextChargeCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  nextChargeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  nextChargeTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#1A1A1A",
  },
  nextChargeSub: {
    marginTop: 2,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
  },
  nextChargeDue: {
    marginTop: 4,
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#357FC1",
  },
  sectionBlock: {
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#1A1A1A",
  },
  sectionMeta: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#767474",
  },
  chargeRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  chargeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  chargeTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  chargeDesc: {
    marginTop: 2,
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
  },
  chargeMetaRow: {
    marginTop: 8,
  },
  chargeAmount: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#1A1A1A",
  },
  chargeDue: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#767474",
  },
  paidAtText: {
    marginTop: 6,
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#80CFA9",
  },
  currentMarker: {
    marginTop: 6,
    fontFamily: "Poppins-Medium",
    fontSize: 11,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusChipText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(214, 69, 69, 0.2)",
  },
});
