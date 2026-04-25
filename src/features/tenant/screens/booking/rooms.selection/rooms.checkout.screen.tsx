import React, { useMemo, useState } from "react";
import { Alert, Platform, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Button,
  Button as PaperButton,
  Checkbox,
  Divider,
  Icon,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { Box, HStack, VStack } from "@gluestack-ui/themed";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import UserInformatioCard from "@/components/ui/Information/UserInformatioCard";
import { BorderRadius, Spacing } from "@/constants";
import { RootState } from "@/application/store/stores";

import { useCreateBookingMutation } from "@/infrastructure/booking/booking.redux.api";
import { useGetOneQuery as useGetOwnerQuery } from "@/infrastructure/owner/owner.redux.api";
import { useGetOneQuery } from "@/infrastructure/room/rooms.redux.api";
import { isTenantAccess } from "@/infrastructure/access/access.schema";
import { useGetTenantAccessQuery } from "@/infrastructure/access/access.redux.api";
import { useGetAgreementPreviewQuery } from "@/infrastructure/agreements/agreements.redux.api";
import { useDecisionModal } from "@/components/ui/Modals/DecisionModalWrapper";

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  copy.setHours(9, 0, 0, 0);
  return copy;
};

const addMonths = (date: Date, months: number) => {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
};

const formatCurrency = (value: number) =>
  `₱ ${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getErrorMessage = (err: any) => {
  const message = err?.data?.message ?? err?.error ?? err?.message;

  if (Array.isArray(message)) {
    return message.join("\n");
  }

  if (typeof message === "string") {
    return message;
  }

  if (message && typeof message === "object") {
    return JSON.stringify(message);
  }

  return "Room capacity exceeded or server error.";
};

export default function RoomsCheckoutScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { roomId, ownerId, bhId } = route.params;

  const tenantId = useSelector(
    (state: RootState) => state.tenants.selectedUser?.id,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [occupants, setOccupants] = useState(1);

  const defaultCheckIn = useMemo(() => addDays(new Date(), 1), []);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(addMonths(defaultCheckIn, 1));

  const [showPicker, setShowPicker] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [acceptedBookingNotice, setAcceptedBookingNotice] = useState(false);

  const {
    data: access,
    isLoading: isAccessLoading,
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

  const {
    data: agreementPreview,
    isLoading: isAgreementLoading,
    isFetching: isAgreementFetching,
    refetch: refetchAgreementPreview,
  } = useGetAgreementPreviewQuery(
    {
      roomId,
      tenantId: tenantId!,
      occupantsCount: occupants,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
    },
    {
      skip: !tenantId || !roomId,
      refetchOnMountOrArgChange: true,
    },
  );

  const [createBooking, { isLoading: isBookingLoading }] =
    useCreateBookingMutation();

  const { showDecision, hideDecision } = useDecisionModal();

  const maxAvailable =
    (roomData?.maxCapacity ?? 1) - (roomData?.currentCapacity ?? 0);

  const unitPrice = Number(roomData?.price ?? 0);
  const totalAmount =
    agreementPreview?.preview.totalAmount ?? unitPrice * occupants;

  const isBusy =
    isRoomLoading || isAccessLoading || isAgreementLoading || isBookingLoading;

  const canSubmit =
    acceptedRules &&
    acceptedBookingNotice &&
    !!agreementPreview &&
    !isBookingLoading &&
    !isAgreementFetching &&
    maxAvailable > 0;

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");

    if (selectedDate) {
      const nextCheckIn = new Date(selectedDate);
      nextCheckIn.setHours(9, 0, 0, 0);

      setCheckIn(nextCheckIn);
      setCheckOut(addMonths(nextCheckIn, 1));
      setAcceptedRules(false);
      setAcceptedBookingNotice(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);

    await Promise.allSettled([refetchAccessData(), refetchAgreementPreview()]);

    setRefreshing(false);
  }, [refetchAccessData, refetchAgreementPreview]);

  const submitBooking = async () => {
    if (!tenantId || !roomId || !agreementPreview) return;

    try {
      const createdBooking = await createBooking({
        roomId,
        payload: {
          tenantId,
          startDate: checkIn.toISOString(),
          endDate: checkOut.toISOString(),
          occupantsCount: occupants,
          tenantAcceptedTerms: acceptedRules && acceptedBookingNotice,
          termsVersion: agreementPreview.termsVersion,
        },
      }).unwrap();

      hideDecision();

      ReactNativeHapticFeedback.trigger("notificationSuccess", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });

      Alert.alert(
        "Reservation Sent",
        "Your booking request and digital agreement snapshot were saved.",
        [{ text: "Done", onPress: () => navigation.popToTop() }],
      );
    } catch (err: any) {
      hideDecision();

      console.log("createBooking error:", JSON.stringify(err, null, 2));

      Alert.alert("Error", getErrorMessage(err));
    }
  };

  const handleConfirmRequest = () => {
    triggerHaptic();

    if (!agreementPreview) {
      Alert.alert(
        "Agreement Not Ready",
        "Please wait for the agreement preview to finish loading.",
      );
      return;
    }

    showDecision({
      title: <Text style={s.modalTitle}>Confirm Reservation</Text>,
      body: (
        <VStack space="sm">
          <Text style={s.modalBody}>
            This will submit your booking request and save a digital agreement
            snapshot using the rules shown on this screen.
          </Text>

          <Surface
            elevation={0}
            style={[
              s.modalSummaryCard,
              { borderColor: theme.colors.outlineVariant },
            ]}
          >
            <VStack space="xs">
              <HStack justifyContent="space-between">
                <Text style={s.modalLabel}>Room</Text>
                <Text style={s.modalValue}>
                  {agreementPreview.preview.roomNumber}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text style={s.modalLabel}>Occupants</Text>
                <Text style={s.modalValue}>{occupants}</Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text style={s.modalLabel}>Check-in</Text>
                <Text style={s.modalValue}>
                  {checkIn.toLocaleDateString("en-PH")}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text style={s.modalLabel}>Estimated Total</Text>
                <Text style={s.modalValue}>{formatCurrency(totalAmount)}</Text>
              </HStack>
            </VStack>
          </Surface>

          <Text style={s.modalCaption}>
            Final move-in still depends on owner approval.
          </Text>
        </VStack>
      ),
      footer: (
        <HStack space="md" justifyContent="flex-end" style={{ width: "100%" }}>
          <PaperButton onPress={hideDecision}>Cancel</PaperButton>
          <PaperButton
            mode="contained"
            loading={isBookingLoading}
            disabled={isBookingLoading}
            onPress={submitBooking}
          >
            Confirm
          </PaperButton>
        </HStack>
      ),
    });
  };

  if (isRoomLoading || isAccessLoading || !access) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </Box>
    );
  }

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

        <Surface
          elevation={0}
          style={[
            s.containedCard,
            { borderColor: theme.colors.outlineVariant },
          ]}
        >
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
                  onPress={() => {
                    triggerHaptic();
                    setOccupants(Math.max(1, occupants - 1));
                    setAcceptedRules(false);
                    setAcceptedBookingNotice(false);
                  }}
                  disabled={occupants <= 1}
                />

                <Text style={s.counterText}>{occupants}</Text>

                <IconButton
                  icon="plus"
                  mode="outlined"
                  size={20}
                  onPress={() => {
                    triggerHaptic();
                    setOccupants(Math.min(maxAvailable, occupants + 1));
                    setAcceptedRules(false);
                    setAcceptedBookingNotice(false);
                  }}
                  disabled={occupants >= maxAvailable}
                />
              </HStack>
            </HStack>
          </VStack>
        </Surface>

        <Surface
          elevation={0}
          style={[
            s.containedCard,
            { borderColor: theme.colors.outlineVariant },
          ]}
        >
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
                onPress={() => {
                  triggerHaptic();
                  setShowPicker(true);
                }}
                compact
              >
                Change
              </PaperButton>
            </HStack>

            <Divider style={s.hairline} />

            <HStack justifyContent="space-between">
              <Text style={s.subValue}>Check-out</Text>
              <Text style={s.mainValue}>
                {checkOut.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </HStack>

            <HStack justifyContent="space-between">
              <Text style={s.subValue}>Estimated Total</Text>
              <Text style={s.mainValue}>{formatCurrency(totalAmount)}</Text>
            </HStack>
          </VStack>
        </Surface>

        {showPicker && (
          <DateTimePicker
            value={checkIn}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={addDays(new Date(), 1)}
          />
        )}

        <Surface
          elevation={0}
          style={[s.infoBox, { borderColor: theme.colors.primary }]}
        >
          <HStack space="sm">
            <Icon
              source="information-outline"
              size={18}
              color={theme.colors.primary}
            />

            <VStack flex={1}>
              <Text style={s.infoText}>
                This request will be reviewed by the owner.
              </Text>
              <Text style={s.infoText}>
                Your accepted agreement snapshot will be saved once submitted.
              </Text>
            </VStack>
          </HStack>
        </Surface>

        <Surface
          elevation={0}
          style={[
            s.agreementCard,
            { borderColor: theme.colors.outlineVariant },
          ]}
        >
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <VStack flex={1}>
                <Text style={s.cardLabel}>DIGITAL AGREEMENT</Text>
                <Text style={s.agreementTitle}>
                  Boarding House Rules & Booking Terms
                </Text>
              </VStack>

              {isAgreementFetching && <ActivityIndicator size="small" />}
            </HStack>

            <Divider style={s.hairline} />

            {agreementPreview?.rules?.length ? (
              <VStack space="sm">
                {agreementPreview.rules.map((rule, index) => (
                  <Surface
                    key={rule.id}
                    elevation={0}
                    style={[
                      s.ruleBox,
                      { borderColor: theme.colors.outlineVariant },
                    ]}
                  >
                    <Text style={s.ruleTitle}>
                      {index + 1}. {rule.title}
                    </Text>
                    <Text style={s.ruleContent}>{rule.content}</Text>
                  </Surface>
                ))}
              </VStack>
            ) : (
              <Text style={s.emptyRulesText}>
                No active house rules configured.
              </Text>
            )}

            <Text style={s.disclaimerText}>
              {agreementPreview?.disclaimer ??
                "This agreement records the initial booking arrangement only."}
            </Text>

            <Text style={s.versionText}>
              Terms Version: {agreementPreview?.termsVersion ?? "Loading..."}
            </Text>
          </VStack>
        </Surface>

        <VStack space="sm">
          <HStack space="sm" alignItems="flex-start">
            <Checkbox.Android
              status={acceptedRules ? "checked" : "unchecked"}
              onPress={() => {
                triggerHaptic();
                setAcceptedRules((prev) => !prev);
              }}
            />

            <Text style={s.termsText}>
              I have read and accept the boarding house rules shown above.
            </Text>
          </HStack>

          <HStack space="sm" alignItems="flex-start">
            <Checkbox.Android
              status={acceptedBookingNotice ? "checked" : "unchecked"}
              onPress={() => {
                triggerHaptic();
                setAcceptedBookingNotice((prev) => !prev);
              }}
            />

            <Text style={s.termsText}>
              I understand this is a booking request and final move-in depends
              on owner approval.
            </Text>
          </HStack>
        </VStack>

        <Button
          mode="contained"
          disabled={!canSubmit}
          loading={isBookingLoading}
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
  container: {
    padding: Spacing.md,
  },

  headerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 22,
    textAlign: "center",
    marginVertical: Spacing.base,
    color: "#1A1A1A",
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
    backgroundColor: "#FFFFFF",
  },

  cardLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
    color: "#357FC1",
    letterSpacing: 1,
  },

  mainValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#1A1A1A",
  },

  subValue: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
  },

  counterText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    minWidth: 20,
    textAlign: "center",
    color: "#1A1A1A",
  },

  hairline: {
    height: 1,
    backgroundColor: "#EEEEEE",
  },

  infoBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "#D6ECFA",
    borderWidth: 1,
  },

  infoText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#123969",
  },

  agreementCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },

  agreementTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#1A1A1A",
    marginTop: 2,
  },

  ruleBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    backgroundColor: "#F7F9FC",
  },

  ruleTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#1A1A1A",
    marginBottom: 4,
  },

  ruleContent: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#1A1A1A",
    lineHeight: 18,
  },

  emptyRulesText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
  },

  disclaimerText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
    lineHeight: 16,
  },

  versionText: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
    color: "#357FC1",
  },

  termsText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    flex: 1,
    color: "#1A1A1A",
    paddingTop: 8,
    lineHeight: 17,
  },

  submitBtn: {
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },

  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1A1A1A",
  },

  modalBody: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#1A1A1A",
    lineHeight: 19,
  },

  modalSummaryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    backgroundColor: "#F7F9FC",
  },

  modalLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
  },

  modalValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "#1A1A1A",
  },

  modalCaption: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
  },
});
