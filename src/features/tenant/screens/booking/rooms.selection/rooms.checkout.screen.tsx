import React, { useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import {
  Text,
  Button,
  Surface,
  Checkbox,
  useTheme,
  Divider,
  Button as PaperButton, // Added for footer
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import UserInformatioCard from "@/components/ui/Information/UserInformatioCard";
import { Spacing, BorderRadius } from "@/constants";
import { useCreateBookingMutation } from "@/infrastructure/booking/booking.redux.api";
import { useGetOneQuery as useGetOwnerQuery } from "@/infrastructure/owner/owner.redux.api";
import { RootState } from "@/application/store/stores";
import { useDecisionModal } from "@/components/ui/Modals/DecisionModalWrapper";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { VStack } from "@gluestack-ui/themed";

export default function RoomsCheckoutScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { roomId, ownerId } = route.params;

  const tenantId = useSelector(
    (state: RootState) => state.tenants.selectedUser?.id,
  );

  const { data: ownerData } = useGetOwnerQuery(ownerId, { skip: !ownerId });
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const { showDecision, hideDecision } = useDecisionModal();

  // State
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1)),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [terms, setTerms] = useState({ t1: false, t2: false });

  const canSubmit = terms.t1 && terms.t2;

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setCheckIn(selectedDate);
      const nextMonth = new Date(selectedDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCheckOut(nextMonth);
    }
  };

  const handleConfirmRequest = () => {
    ReactNativeHapticFeedback.trigger("impactMedium");

    showDecision({
      title: (
        <Text variant="titleLarge" style={s.bold}>
          Send Reservation Request?
        </Text>
      ),
      body: (
        <VStack space="xs">
          <Text variant="bodyMedium">
            You are about to send a booking intent for{" "}
            <Text style={s.bold}>{checkIn.toLocaleDateString()}</Text>.
          </Text>
          <Text
            variant="bodySmall"
            style={{ marginTop: 8, color: theme.colors.outline }}
          >
            The owner will be notified to review your profile.
          </Text>
        </VStack>
      ),
      footer: (
        <View style={s.modalFooter}>
          <PaperButton onPress={hideDecision} mode="text">
            Cancel
          </PaperButton>
          <PaperButton
            mode="contained"
            loading={isLoading}
            onPress={submitBooking}
            style={{ borderRadius: BorderRadius.sm }}
          >
            Confirm & Send
          </PaperButton>
        </View>
      ),
    });
  };

  const submitBooking = async () => {
    if (!tenantId || !roomId) return;

    try {
      await createBooking({
        roomId,
        payload: {
          tenantId,
          startDate: checkIn.toISOString(),
          endDate: checkOut.toISOString(),
        },
      }).unwrap();

      hideDecision();
      ReactNativeHapticFeedback.trigger("notificationSuccess");

      Alert.alert(
        "Request Sent Successfully",
        "The owner has been notified. You can track this in your bookings list.",
        [{ text: "Done", onPress: () => navigation.popToTop() }],
      );
    } catch (err: any) {
      hideDecision();
      Alert.alert(
        "Request Failed",
        err?.data?.message || "Could not process booking.",
      );
    }
  };

  return (
    <StaticScreenWrapper
      loading={isLoading}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={s.container}>
        <Text variant="headlineSmall" style={s.headerText}>
          Reservation Request
        </Text>

        <Text variant="labelLarge" style={s.sectionLabel}>
          PROPERTY OWNER
        </Text>
        <UserInformatioCard user={ownerData} />

        <Surface elevation={1} style={s.dateCard}>
          <View style={s.dateHeader}>
            <View>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.primary }}
              >
                PROPOSED CHECK-IN
              </Text>
              <Text variant="titleLarge" style={s.bold}>
                {checkIn.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <Button mode="outlined" onPress={() => setShowPicker(true)} compact>
              Change
            </Button>
          </View>
          <Divider style={s.divider} />
          <View style={s.durationRow}>
            <Text variant="bodyMedium">Reservation Period:</Text>
            <Text variant="bodyLarge" style={s.bold}>
              1 Month (Standard)
            </Text>
          </View>
        </Surface>

        {showPicker && (
          <DateTimePicker
            value={checkIn}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <Surface
          elevation={0}
          style={[
            s.notesCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text variant="titleSmall" style={{ marginBottom: 4 }}>
            Important Notes
          </Text>
          <Text variant="bodySmall">
            • This room will be marked "Pending" for you.
          </Text>
          <Text variant="bodySmall">
            • Final move-in depends on owner approval.
          </Text>
        </Surface>

        <View style={s.termsContainer}>
          <View style={s.checkboxRow}>
            <Checkbox.Android
              status={terms.t1 ? "checked" : "unchecked"}
              onPress={() => setTerms({ ...terms, t1: !terms.t1 })}
              color={theme.colors.primary}
            />
            <Text variant="bodySmall" style={s.termsText}>
              I understand this is a reservation intent, not a guaranteed
              booking.
            </Text>
          </View>
          <View style={s.checkboxRow}>
            <Checkbox.Android
              status={terms.t2 ? "checked" : "unchecked"}
              onPress={() => setTerms({ ...terms, t2: !terms.t2 })}
              color={theme.colors.primary}
            />
            <Text variant="bodySmall" style={s.termsText}>
              I agree to discuss final arrangements directly with the owner.
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          disabled={!canSubmit || isLoading}
          onPress={handleConfirmRequest}
          style={s.submitBtn}
          contentStyle={{ height: 56 }}
          labelStyle={{ fontSize: 16, fontWeight: "700" }}
        >
          Send Booking Request
        </Button>
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { padding: Spacing.md, flex: 1 },
  headerText: { fontWeight: "900", marginBottom: 24, textAlign: "center" },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.6,
    letterSpacing: 1,
  },
  dateCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: "white",
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bold: { fontWeight: "bold" },
  divider: { marginVertical: 12 },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notesCard: { padding: 16, borderRadius: 16, marginTop: 8 },
  termsContainer: { marginTop: 24, gap: 8 },
  checkboxRow: { flexDirection: "row", alignItems: "center", paddingRight: 32 },
  termsText: { flexShrink: 1, opacity: 0.8 },
  submitBtn: { marginTop: 32, borderRadius: 16 },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    width: "100%",
  },
});
