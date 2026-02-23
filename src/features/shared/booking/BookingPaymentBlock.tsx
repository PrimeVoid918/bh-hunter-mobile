import React from "react";
import { View } from "react-native";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { formatNumberWithCommas } from "../../../infrastructure/utils/string.formatter.util";
import {
  Button,
  Card,
  Text,
  Icon,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";

interface BookingPaymentBlockInterface {
  booking: GetBooking;
  viewerRole: "TENANT" | "OWNER";
  // onUploadProof?: () => void;
  // onVerifyPayment?: () => void;
  onPayNow?: () => void;
}

export default function BookingPaymentBlock({
  booking,
  viewerRole,
  onPayNow,
}: BookingPaymentBlockInterface) {
  const { status, totalAmount, currency, paymentProofId, room } = booking;
  const theme = useTheme();

  const isTenant = viewerRole === "TENANT";
  const isOwner = viewerRole === "OWNER";

  if (status === "PENDING_REQUEST") return null;

  return (
    <Card mode="contained" style={{ marginVertical: 8, borderRadius: 12 }}>
      <Card.Content>
        {/* HEADER SECTION */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View>
            <Text variant="labelMedium" style={{ color: theme.colors.outline }}>
              Payment Amount
            </Text>
            <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
              {formatNumberWithCommas(room.price)} {currency ?? "PHP"}
            </Text>
          </View>

          {/* STATUS CHIP INDICATOR */}
          {status === "PAYMENT_APPROVAL" && (
            <ActivityIndicator
              animating={true}
              size="small"
              color={theme.colors.primary}
            />
          )}
        </View>

        {/* TENANT ACTIONS & FEEDBACK */}
        {isTenant && (
          <View style={{ gap: 8 }}>
            {status === "AWAITING_PAYMENT" && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Icon
                    source="information-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                    Advance payment required to secure booking.
                  </Text>
                </View>

                {/* {onUploadProof && (
                  <Button mode="outlined" onPress={onUploadProof} icon="upload">
                    Upload Payment Proof
                  </Button>
                )} */}

                {onPayNow && (
                  <Button
                    mode="contained"
                    onPress={onPayNow}
                    icon="credit-card-outline"
                    contentStyle={{ height: 48 }}
                  >
                    Pay Now
                  </Button>
                )}
              </>
            )}

            {status === "PAYMENT_FAILED" && (
              <View
                style={{
                  backgroundColor: theme.colors.errorContainer,
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: theme.colors.error }}>
                  Payment failed. Please try again or use a different method.
                </Text>
                {onPayNow && (
                  <Button
                    mode="contained"
                    onPress={onPayNow}
                    buttonColor={theme.colors.error}
                    style={{ marginTop: 8 }}
                  >
                    Retry Payment
                  </Button>
                )}
              </View>
            )}

            {status === "PAYMENT_APPROVAL" && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  source="clock-outline"
                  size={20}
                  color={theme.colors.secondary}
                />
                <Text
                  variant="bodyMedium"
                  style={{ marginLeft: 8, color: theme.colors.secondary }}
                >
                  Waiting for owner to verify payment...
                </Text>
              </View>
            )}
          </View>
        )}

        {/* OWNER ACTION */}
        {/* {isOwner && status === "PAYMENT_APPROVAL" && (
          <View style={{ gap: 8 }}>
            <Text variant="bodyMedium">Payment proof submitted by tenant.</Text>
            {onVerifyPayment && (
              <Button mode="contained" onPress={onVerifyPayment} icon="check-decagram">
                Verify Payment
              </Button>
            )}
          </View>
        )} */}

        {/* FINAL STATES */}
        <View style={{ marginTop: 4 }}>
          {status === "COMPLETED_BOOKING" && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon source="check-circle" size={20} color="#22C55E" />
              <Text
                variant="bodyMedium"
                style={{ marginLeft: 8, color: "#22C55E", fontWeight: "600" }}
              >
                Payment completed successfully
              </Text>
            </View>
          )}

          {(status === "CANCELLED_BOOKING" ||
            status === "REJECTED_BOOKING") && (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.error, fontStyle: "italic" }}
            >
              Payment cancelled or declined
            </Text>
          )}
        </View>

        {/* DEBUG / OPTIONAL */}
        {/* {paymentProofId && <Text variant="labelSmall">Proof ID: {paymentProofId}</Text>} */}
      </Card.Content>
    </Card>
  );
}
