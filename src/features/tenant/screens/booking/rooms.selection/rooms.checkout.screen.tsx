import React, { useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import {
  Text,
  Button,
  Surface,
  Checkbox,
  useTheme,
  Divider,
  Button as PaperButton,
  ActivityIndicator,
  IconButton,
  Icon,
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
import { VStack, HStack, Box } from "@gluestack-ui/themed";
import { useGetOneQuery } from "@/infrastructure/room/rooms.redux.api";
import { isTenantAccess } from "@/infrastructure/access/access.schema";
import { useGetTenantAccessQuery } from "@/infrastructure/access/access.redux.api";

export default function RoomsCheckoutScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { roomId, ownerId, bhId } = route.params;

  const tenantId = useSelector(
    (state: RootState) => state.tenants.selectedUser?.id,
  );

  const {
    data: access,
    isLoading: isAccessLoading,
    isFetching: isAccessFetching,
    refetch: refetchAccessData,
  } = useGetTenantAccessQuery(
    { id: tenantId! },
    { skip: !tenantId, refetchOnMountOrArgChange: true },
  );

  const { data: ownerData } = useGetOwnerQuery(ownerId, { skip: !ownerId });

  const { data: roomData, isLoading: isRoomLoading } = useGetOneQuery({
    roomId,
    boardingHouseId: bhId,
  });

  const [createBooking, { isLoading: isBookingLoading }] =
    useCreateBookingMutation();

  const { showDecision, hideDecision } = useDecisionModal();
  const [refreshing, setRefreshing] = React.useState(false);

  const [occupants, setOccupants] = useState(1);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1)),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [terms, setTerms] = useState({ t1: false, t2: false });

  const maxAvailable =
    (roomData?.maxCapacity ?? 1) - (roomData?.currentCapacity ?? 0);

  const canSubmit = terms.t1 && terms.t2 && !isBookingLoading;

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setCheckIn(selectedDate);
      const nextMonth = new Date(selectedDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCheckOut(nextMonth);
    }
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
          occupantsCount: occupants,
        },
      }).unwrap();

      hideDecision();
      ReactNativeHapticFeedback.trigger("notificationSuccess");

      Alert.alert("Success", "Reservation request sent.", [
        { text: "OK", onPress: () => navigation.popToTop() },
      ]);
    } catch (err: any) {
      hideDecision();
      Alert.alert(
        "Error",
        err?.data?.message || "Room capacity exceeded or server error.",
      );
    }
  };

  const handleConfirmRequest = () => {
    ReactNativeHapticFeedback.trigger("impactMedium");

    showDecision({
      title: <Text style={s.modalTitle}>Confirm Reservation</Text>,
      body: (
        <VStack space="xs">
          <Text variant="bodyMedium">
            Requesting booking for {occupants} occupant(s).
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Check-in: {checkIn.toLocaleDateString()}
          </Text>
        </VStack>
      ),
      footer: (
        <HStack space="md" justifyContent="flex-end" style={{ width: "100%" }}>
          <PaperButton onPress={hideDecision}>Cancel</PaperButton>
          <PaperButton
            mode="contained"
            loading={isBookingLoading}
            onPress={submitBooking}
          >
            Confirm
          </PaperButton>
        </HStack>
      ),
    });
  };

  if (isRoomLoading || isAccessLoading || !access) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    refetchAccessData();
    setRefreshing(false);
  }, []);

  const lockdown = isTenantAccess(access) ? !access.canBookRoom : false;

  return (
    <StaticScreenWrapper
      loading={isBookingLoading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      style={{ backgroundColor: theme.colors.background }}
      lockdown={lockdown}
      onLockdownAction={() => navigation.goBack()}
    >
      <VStack style={s.container} space="lg">
        <Text style={s.headerText}>Reservation Request</Text>

        <Box>
          <Text style={s.sectionLabel}>Property Owner</Text>
          <UserInformatioCard user={ownerData} />
        </Box>

        <Surface elevation={0} style={s.containedCard}>
          <VStack space="sm">
            <Text style={s.cardLabel}>NUMBER OF OCCUPANTS</Text>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text style={s.mainValue}>Total Tenants</Text>
                <Text style={s.subValue}>Available slots: {maxAvailable}</Text>
              </VStack>
              <HStack alignItems="center" space="md">
                <IconButton
                  icon="minus"
                  mode="outlined"
                  size={20}
                  onPress={() => setOccupants(Math.max(1, occupants - 1))}
                  disabled={occupants <= 1}
                />
                <Text style={s.counterText}>{occupants}</Text>
                <IconButton
                  icon="plus"
                  mode="outlined"
                  size={20}
                  onPress={() =>
                    setOccupants(Math.min(maxAvailable, occupants + 1))
                  }
                  disabled={occupants >= maxAvailable}
                />
              </HStack>
            </HStack>
          </VStack>
        </Surface>

        <Surface elevation={0} style={s.containedCard}>
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text style={s.cardLabel}>PROPOSED CHECK-IN</Text>
                <Text style={s.mainValue}>
                  {checkIn.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </VStack>
              <PaperButton
                mode="outlined"
                onPress={() => setShowPicker(true)}
                compact
              >
                Change
              </PaperButton>
            </HStack>
            <Divider style={s.hairline} />
            <HStack justifyContent="space-between">
              <Text style={s.subValue}>Duration</Text>
              <Text style={s.mainValue}>Standard (30 Days)</Text>
            </HStack>
          </VStack>
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

        <Surface elevation={0} style={s.infoBox}>
          <HStack space="sm">
            <Icon
              source="information-outline"
              size={18}
              color={theme.colors.primary}
            />
            <VStack flex={1}>
              <Text style={s.infoText}>
                This room will be marked "Pending" for you upon sending.
              </Text>
              <Text style={s.infoText}>
                Final move-in depends on owner approval.
              </Text>
            </VStack>
          </HStack>
        </Surface>

        <VStack space="sm">
          <HStack space="sm" alignItems="flex-start">
            <Checkbox.Android
              status={terms.t1 ? "checked" : "unchecked"}
              onPress={() => setTerms({ ...terms, t1: !terms.t1 })}
            />
            <Text style={s.termsText}>
              I understand this is a reservation intent, not a guaranteed
              booking.
            </Text>
          </HStack>
          <HStack space="sm" alignItems="flex-start">
            <Checkbox.Android
              status={terms.t2 ? "checked" : "unchecked"}
              onPress={() => setTerms({ ...terms, t2: !terms.t2 })}
            />
            <Text style={s.termsText}>
              I agree to discuss final arrangements directly with the owner.
            </Text>
          </HStack>
        </VStack>

        <Button
          mode="contained"
          disabled={!canSubmit}
          onPress={handleConfirmRequest}
          style={s.submitBtn}
          contentStyle={{ height: 56 }}
        >
          Send Booking Request
        </Button>
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { padding: Spacing.md },
  headerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 22,
    textAlign: "center",
    marginVertical: Spacing.base,
  },
  sectionLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#767474",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  containedCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
  },
  cardLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
    color: "#357FC1",
    letterSpacing: 1,
  },
  mainValue: { fontFamily: "Poppins-SemiBold", fontSize: 15, color: "#1A1A1A" },
  subValue: { fontFamily: "Poppins-Regular", fontSize: 12, color: "#767474" },
  counterText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    minWidth: 20,
    textAlign: "center",
  },
  hairline: { height: 1, backgroundColor: "#EEEEEE" },
  infoBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "#D6ECFA",
    borderWidth: 1,
    borderColor: "#357FC140",
  },
  infoText: { fontFamily: "Poppins-Regular", fontSize: 12, color: "#123969" },
  termsText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    flex: 1,
    color: "#1A1A1A",
    paddingTop: 8,
  },
  submitBtn: { borderRadius: BorderRadius.md, marginTop: Spacing.lg },
  modalTitle: { fontFamily: "Poppins-SemiBold", fontSize: 18 },
});
