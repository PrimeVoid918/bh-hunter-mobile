import { View, Text, Linking, StyleSheet, Vibration } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Colors, Fontsize, GlobalStyle, Spacing } from "@/constants";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import BookingDecisionBlock from "./BookingDecisionBlock";
import BookingPaymentBlock from "./BookingPaymentBlock";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import {
  useCancelBookingMutation,
  useCreatePaymongoCheckoutMutation,
  useGetAllQuery,
  useGetOneQuery as useGetOneBookinQuery,
  usePatchApproveBookingMutation,
  usePatchRejectBookingMutation,
} from "@/infrastructure/booking/booking.redux.api";
import UserInformationCard from "@/components/ui/Information/UserInformatioCard";
import { useGetOneQuery as useGetOneTenantQuery } from "@/infrastructure/tenants/tenant.redux.api";
import { useGetOneQuery as useGetOneOwnerQuery } from "@/infrastructure/owner/owner.redux.api";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import BookingBHCard from "./BookingBHCard";
import BookingRoomCard from "./BookingRoomCard";
import {
  GetBooking,
  getBookingStatusDetails,
} from "@/infrastructure/booking/booking.schema";
import { Divider, Icon, Surface, useTheme } from "react-native-paper";
import PayMongoWebView from "./PaymongoWebView";
import PlatformGuidelines from "./PlatformGuidelines";
import BookingInfoBar from "./BookingInfoBar";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TenantBookingStackParamList } from "../../tenant/screens/booking/navigation/booking.types";
import { navigationRef } from "@/application/navigation/navigationRef";

type Role = "TENANT" | "OWNER";

export default function BookingStatusScreen({ route }) {
  const { bookId }: { bookId: number } = route.params;

  const navigate =
    useNavigation<NativeStackNavigationProp<TenantBookingStackParamList>>();

  const { selectedUser } = useDynamicUserApi();
  if (!selectedUser) {
    return <Text>Loading user...</Text>;
  }

  const role = selectedUser?.role as Role;
  const userId = selectedUser?.id!;

  const [refreshing, setRefreshing] = React.useState(false);

  const {
    data: bookingData,
    isLoading,
    isError,
    refetch,
  } = useGetAllQuery({ page: 1, bookId: bookId, limit: 15 });
  const booking = bookingData?.[0] as GetBooking;

  const tenantQuery = useGetOneTenantQuery(booking?.tenantId!, {
    skip: role !== "OWNER" || !booking,
  });

  const ownerQuery = useGetOneOwnerQuery(booking?.boardingHouse?.ownerId!, {
    skip: role !== "TENANT" || !booking,
  });
  const userData =
    role === "OWNER"
      ? tenantQuery.data
      : role === "TENANT"
        ? ownerQuery.data
        : undefined;
  // const { data: tenantData } = useGetOneTenantQuery(booking?.tenantId!);

  const [approveBooking] = usePatchApproveBookingMutation();
  const [rejectBooking] = usePatchRejectBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();
  // const [createCheckout] = useCreatePaymongoCheckoutMutation();
  const [createCheckout, { isLoading: isCheckOutLoading }] =
    useCreatePaymongoCheckoutMutation();

  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);
  const [showWebView, setShowWebView] = React.useState(false);
  const handlePayNow = async () => {
    try {
      const response = await createCheckout({
        bookingId: booking!.id,
      }).unwrap();

      // Instead of Linking.openURL, we trigger the WebView
      setCheckoutUrl(response.checkoutUrl);
      setShowWebView(true);
    } catch (error) {
      console.error("Failed to create PayMongo checkout:", error);
    }
  };

  const handlePageRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  const handleActionFeedback = () => {
    // Standard vibration for feedback without expo-haptics
    Vibration.vibrate(10);
  };

  const theme = useTheme();
  if (isLoading || !booking) {
    return <FullScreenLoaderAnimated />;
  }

  const gotoBh = () => {
    if (!navigationRef.isReady()) return;
    navigationRef.navigate("Booking" as any, {
      screen: "BoardingHouseDetails",
      params: { id: booking.room.boardingHouse.id },
    });
  };

  const gotoRoom = () => {
    if (!navigationRef.isReady()) return;
    navigationRef.navigate("Booking", {
      screen: "RoomsDetailsScreen",
      params: {
        boardingHouseId: booking.boardingHouse?.id,
        roomId: booking.room.id,
        ownerId: booking.boardingHouse?.ownerId,
      },
    });
  };

  const statusMeta = getBookingStatusDetails(booking.status);

  return (
    <StaticScreenWrapper
      variant="list"
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isLoading}
    >
      <VStack style={s.mainWrapper} space="md">
        {/* 1. STATUS HEADER (Tonal Background) */}
        <Surface
          elevation={0}
          style={[
            s.statusHeader,
            {
              borderColor: statusMeta.color + "40",
              backgroundColor: statusMeta.color + "0D",
            },
          ]}
        >
          <HStack space="md" alignItems="center">
            <Box
              style={[s.statusPill, { backgroundColor: statusMeta.color }]}
            />
            <VStack flex={1}>
              <Text style={[s.statusLabel, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
              <Text style={s.statusDesc}>{statusMeta.description}</Text>
            </VStack>
          </HStack>
        </Surface>

        {/* 2. CORE BOOKING CONTAINER */}
        <Surface elevation={0} style={s.containedGroup}>
          {/* Section: Property */}
          <Box style={s.sectionPadding}>
            <Text style={s.groupHeader}>Property Information</Text>
            <BookingBHCard data={booking} onPress={gotoBh} />
            <Box style={{ marginTop: Spacing.md }}>
              <BookingRoomCard data={booking} onPress={gotoRoom} />
            </Box>
          </Box>

          <Divider style={s.hairline} />

          {/* Section: Reservation Details (SPREAD DATA HERE) */}
          <Box style={s.sectionPadding}>
            <Text style={s.groupHeader}>Reservation Details</Text>

            <VStack space="md">
              {/* Reference ID - Modern Badge style */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text style={s.metaLabel}>Reference ID</Text>
                <Text style={s.metaValueMono}>{booking.reference}</Text>
              </HStack>

              <Divider style={s.hairlineLight} />

              {/* Dates Grid */}
              <HStack space="lg" justifyContent="space-between">
                <VStack flex={1}>
                  <HStack space="xs" alignItems="center">
                    <Icon
                      source="calendar-import"
                      size={14}
                      color={theme.colors.outline}
                    />
                    <Text style={s.metaLabel}>Check-In</Text>
                  </HStack>
                  <Text style={s.metaValue}>
                    {new Date(booking.checkInDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </VStack>

                <VStack flex={1} alignItems="flex-end">
                  <HStack space="xs" alignItems="center">
                    <Icon
                      source="calendar-export"
                      size={14}
                      color={theme.colors.outline}
                    />
                    <Text style={s.metaLabel}>Check-Out</Text>
                  </HStack>
                  <Text style={s.metaValue}>
                    {new Date(booking.checkOutDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </Text>
                </VStack>
              </HStack>

              {/* Total Duration/Date Booked Footer */}
              <Box style={s.metaFooter}>
                <Text style={s.metaFooterText}>
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            </VStack>
          </Box>
        </Surface>

        {/* 3. PARTICIPANTS */}
        <VStack space="xs">
          <Text style={s.groupHeader}>Contacts</Text>
          <UserInformationCard user={userData} />
        </VStack>

        {/* 4. ACTION ZONE */}
        <VStack space="sm">
          <Text style={s.groupHeader}>Management</Text>
          <Surface elevation={0} style={s.actionSurface}>
            <BookingDecisionBlock
              booking={booking}
              viewerRole={role}
              onApprove={(message) =>
                approveBooking({
                  id: bookId,
                  payload: { ownerId: userId, message },
                }).then(refetch)
              }
              onReject={(reason) =>
                rejectBooking({
                  id: bookId,
                  payload: { ownerId: userId, reason },
                }).then(refetch)
              }
              onCancel={(reason) =>
                cancelBooking({
                  id: bookId,
                  payload: { userId, role, reason },
                }).then(refetch)
              }
            />
            <BookingPaymentBlock
              booking={booking}
              viewerRole={role}
              onPayNow={handlePayNow}
            />
          </Surface>
        </VStack>

        <PlatformGuidelines />
      </VStack>

      {/* WebView Overlay */}
      {checkoutUrl && (
        <PayMongoWebView
          visible={showWebView}
          checkoutUrl={checkoutUrl}
          onClose={() => setShowWebView(false)}
          onSuccess={() => {
            setShowWebView(false);
            refetch();
          }}
          onCancel={() => setShowWebView(false)}
        />
      )}
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainWrapper: {
    // paddingHorizontal: Spacing.base,
    // paddingTop: Spacing.md,
    // paddingBottom: Spacing.lg,
  },
  // Status Card (High Visibility)
  statusHeader: {
    padding: Spacing.md,
    borderRadius: 12, // lg
    borderWidth: 1.5,
  },
  statusPill: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  statusLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  statusDesc: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#666",
  },
  // Contained Look
  containedGroup: {
    borderRadius: 16, // xl
    borderWidth: 1,
    borderColor: "#CCCCCC", // outlineVariant
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  sectionPadding: {
    padding: Spacing.md,
  },
  groupHeader: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    color: "#767474",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    paddingLeft: 4,
  },
  metaLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#767474", // theme.colors.outline
  },
  metaValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#1A1A1A",
    marginTop: 2,
  },
  metaValueMono: {
    fontFamily: "Poppins-Medium", // Use Medium for a "code-like" clean look
    fontSize: 13,
    color: "#357FC1", // primary
    backgroundColor: "#D6ECFA", // primaryContainer
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaFooter: {
    backgroundColor: "#F7F9FC",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  metaFooterText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
    fontStyle: "italic",
  },
  hairlineLight: {
    height: 1,
    backgroundColor: "#F0F0F5",
    marginVertical: 4,
  },
  hairline: {
    height: 1,
    backgroundColor: "#CCCCCC",
  },
  hairlineLight: {
    height: 1,
    backgroundColor: "#F0F0F5",
    marginTop: Spacing.md,
  },
  actionSurface: {
    borderRadius: 16, // xl
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    padding: Spacing.md,
  },
});
