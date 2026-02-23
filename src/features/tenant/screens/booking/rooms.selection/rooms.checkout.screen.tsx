import React, { useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import {
  Text,
  Button,
  Surface,
  Checkbox,
  useTheme,
  Divider,
  Avatar,
  IconButton,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSelector } from "react-redux";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import UserInformatioCard from "@/components/ui/Information/UserInformatioCard";
import { Spacing, BorderRadius } from "@/constants";
import { useCreateBookingMutation } from "@/infrastructure/booking/booking.redux.api";
import { useGetOneQuery as useGetOwnerQuery } from "@/infrastructure/owner/owner.redux.api";
import { RootState } from "@/application/store/stores";

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

  // State
  const [showModal, setShowModal] = useState(false);
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

  const handleConfirm = async () => {
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

      Alert.alert(
        "Request Sent",
        "Your reservation request is now pending owner approval.",
        [
          {
            text: "View Dashboard",
            onPress: () => navigation.navigate("BoardingHouseLists"),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to create request.");
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

        {/* 1. Owner Section */}
        <Text variant="labelLarge" style={s.sectionLabel}>
          PROPERTY OWNER
        </Text>
        <UserInformatioCard user={ownerData} />

        {/* 2. Date Selection Section */}
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
              30 Days (Default)
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

        {/* 3. Notes Section */}
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
            • Room is locked for 1 month upon approval.
          </Text>
          <Text variant="bodySmall">
            • Final rent is negotiated directly with owner.
          </Text>
        </Surface>

        {/* 4. Terms Section */}
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

        {/* Submit Action */}
        <Button
          mode="contained"
          disabled={!canSubmit}
          onPress={() => setShowModal(true)}
          style={s.submitBtn}
          contentStyle={{ height: 56 }}
          labelStyle={{ fontSize: 16, fontWeight: "700" }}
        >
          Send Request
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
  notesCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  termsContainer: { marginTop: 24, gap: 8 },
  checkboxRow: { flexDirection: "row", alignItems: "center", paddingRight: 32 },
  termsText: { flexShrink: 1, opacity: 0.8 },
  submitBtn: { marginTop: 32, borderRadius: 16 },
});
