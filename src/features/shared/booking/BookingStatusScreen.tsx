import { View, Text, Linking, StyleSheet, Vibration } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Colors, Fontsize, GlobalStyle, Spacing } from "@/constants";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import BookingDecisionBlock from "./BookingDecisionBlock";
import BookingPaymentBlock from "./BookingPaymentBlock";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import {
  useApproveExtensionMutation,
  useCancelBookingMutation,
  useCreateBookingChargeCheckoutMutation,
  useGetAllQuery,
  useGetBillingStatementsQuery,
  useGetBookingStatusQuery,
  useGetOneQuery as useGetOneBookinQuery,
  useGetRefundPreviewQuery,
  usePatchApproveBookingMutation,
  usePatchRejectBookingMutation,
  useRejectExtensionMutation,
  useRequestExtensionMutation,
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
import {
  Divider,
  Icon,
  Surface,
  useTheme,
  Portal,
  Modal,
  Button,
} from "react-native-paper";
import PayMongoWebView from "./PaymongoWebView";
import PlatformGuidelines from "./PlatformGuidelines";
import { navigationRef } from "@/application/navigation/navigationRef";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PropertiesStackParamList } from "../../owner/screens/properties/navigation/properties.stack.types";
import BookingAgreementBlock from "./BookingAgreementBlock";
import WebView from "react-native-webview";
import api from "@/application/config/api";

type Role = "TENANT" | "OWNER";

export default function BookingStatusScreen({ route }) {
  const { bookId }: { bookId: number } = route.params;
  const theme = useTheme();
  const { selectedUser } = useDynamicUserApi();

  const ownerNavigation =
    useNavigation<NativeStackNavigationProp<PropertiesStackParamList>>();

  // Modal States
  const [errorModalVisible, setErrorModalVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

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

  const {
    data: bookingStatus,
    isLoading: isStatusLoading,
    refetch: refetchStatus,
  } = useGetBookingStatusQuery(bookId);

  const {
    data: billingStatements,
    isLoading: isBillingStatementsLoading,
    refetch: refetchBillingStatements,
  } = useGetBillingStatementsQuery(bookId);

  const [billingStatementUrl, setBillingStatementUrl] = React.useState<
    string | null
  >(null);
  const [showBillingStatementWebView, setShowBillingStatementWebView] =
    React.useState(false);

  const shouldLoadRefundPreview =
    role === "TENANT" && booking?.status === "COMPLETED_BOOKING";

  const {
    data: refundPreview,
    isLoading: isRefundLoading,
    refetch: refundPreviewRefetch,
  } = useGetRefundPreviewQuery(
    { id: bookId },
    // { skip: !shouldLoadRefundPreview },
  );

  const userData =
    role === "OWNER"
      ? tenantQuery.data
      : role === "TENANT"
        ? ownerQuery.data
        : undefined;

  //* new implementaiion
  const [approveBooking, { isLoading: isApproveLoading }] =
    usePatchApproveBookingMutation();
  const [rejectBooking, { isLoading: isRejectLoading }] =
    usePatchRejectBookingMutation();
  const [cancelBooking, { isLoading: isCancelLoading }] =
    useCancelBookingMutation();
  const [createBookingChargeCheckout, { isLoading: isCheckoutLoading }] =
    useCreateBookingChargeCheckoutMutation();
  const [requestExtension, { isLoading: isRequestExtensionLoading }] =
    useRequestExtensionMutation();
  const [approveExtension, { isLoading: isApproveExtensionLoading }] =
    useApproveExtensionMutation();
  const [rejectExtension, { isLoading: isRejectExtensionLoading }] =
    useRejectExtensionMutation();

  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);
  const [showWebView, setShowWebView] = React.useState(false);

  const isActionLoading =
    isApproveLoading ||
    isRejectLoading ||
    isCancelLoading ||
    isRequestExtensionLoading ||
    isApproveExtensionLoading ||
    isRejectExtensionLoading;

  //! new bookg implementation
  const handleApprove = async (input: {
    message?: string;
    reservationFee: number;
    advancePayment: number;
    securityDeposit: number;
  }) => {
    try {
      await approveBooking({
        id: bookId,
        payload: {
          ownerId: userId,
          message: input.message,
          reservationFee: input.reservationFee,
          advancePayment: input.advancePayment,
          securityDeposit: input.securityDeposit,
        },
      }).unwrap();

      Vibration.vibrate(10);
      refetch();
      refetchStatus();
    } catch (err: any) {
      if (err?.status === 400 || err?.data?.statusCode === 400) {
        setErrorMessage(
          Array.isArray(err?.data?.message)
            ? err.data.message.join("\n")
            : err?.data?.message ||
                "Unable to approve booking. Please check the input values.",
        );
        setErrorModalVisible(true);
      }
    }
  };
  //! new book implementation

  const buildAbsoluteApiUrl = (path: string) => {
    const baseUrl = api.BASE_URL.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
  };

  const handleViewBillingStatement = (htmlPath: string) => {
    const url = buildAbsoluteApiUrl(htmlPath);

    Vibration.vibrate(10);
    setBillingStatementUrl(url);
    setShowBillingStatementWebView(true);
  };

  const handlePayNow = async () => {
    try {
      const response = await createBookingChargeCheckout({
        bookingId: booking!.id,
      }).unwrap();

      setCheckoutUrl(response.checkoutUrl);
      setShowWebView(true);
    } catch (error) {
      console.error("Failed to create PayMongo checkout:", error);
    }
  };

  const handleRequestExtension = async (input: {
    requestedCheckOutDate: string;
    reason?: string;
  }) => {
    try {
      await requestExtension({
        id: bookId,
        payload: {
          tenantId: userId,
          requestedCheckOutDate: input.requestedCheckOutDate,
          reason: input.reason,
        },
      }).unwrap();

      Vibration.vibrate(10);
      refetch();
      refetchStatus();
      refundPreviewRefetch();
    } catch (err: any) {
      setErrorMessage(
        Array.isArray(err?.data?.message)
          ? err.data.message.join("\n")
          : err?.data?.message || "Unable to request extension.",
      );
      setErrorModalVisible(true);
    }
  };

  const handlePageRefresh = () => {
    setRefreshing(true);
    refetch();
    refetchStatus();
    refundPreviewRefetch();
    setRefreshing(false);
    refetchBillingStatements();
  };

  if (isLoading || !booking) {
    return <FullScreenLoaderAnimated />;
  }

  const gotoBh = () => {
    if (!navigationRef.isReady()) return;
    if (role == "TENANT") {
      navigationRef.navigate("Booking", {
        screen: "BoardingHouseDetails",
        params: { id: booking.room.boardingHouse.id },
      });
      return;
    }
  };

  const handleApproveExtension = async (input: {
    extensionId: number;
    extensionAmount: number;
    message?: string;
    adjustments?: {
      label: string;
      amount: number;
    }[];
  }) => {
    try {
      await approveExtension({
        id: bookId,
        extensionId: input.extensionId,
        payload: {
          ownerId: userId,
          extensionAmount: input.extensionAmount,
          message: input.message,
          adjustments: input.adjustments ?? [],
        },
      }).unwrap();

      Vibration.vibrate(10);
      refetch();
      refetchStatus();
      refundPreviewRefetch();
    } catch (err: any) {
      setErrorMessage(
        Array.isArray(err?.data?.message)
          ? err.data.message.join("\n")
          : err?.data?.message || "Unable to approve extension.",
      );
      setErrorModalVisible(true);
    }
  };

  const handleRejectExtension = async (input: {
    extensionId: number;
    reason?: string;
  }) => {
    try {
      await rejectExtension({
        id: bookId,
        extensionId: input.extensionId,
        payload: {
          ownerId: userId,
          reason: input.reason,
        },
      }).unwrap();

      Vibration.vibrate(10);
      refetch();
      refetchStatus();
      refundPreviewRefetch();
    } catch (err: any) {
      setErrorMessage(
        Array.isArray(err?.data?.message)
          ? err.data.message.join("\n")
          : err?.data?.message || "Unable to reject extension.",
      );
      setErrorModalVisible(true);
    }
  };

  const gotoRoom = () => {
    if (!navigationRef.isReady()) return;
    console.log("goto room pressed: ");
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

  const isProcessing = isActionLoading || isRefundLoading;

  return (
    <StaticScreenWrapper
      variant="list"
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isLoading}
    >
      <VStack style={s.mainWrapper} space="md">
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
              style={[
                s.statusPill,
                { backgroundColor: statusMeta.color || "#666" },
              ]}
            />
            <VStack flex={1}>
              <Text
                style={[s.statusLabel, { color: statusMeta.color || "#333" }]}
              >
                {statusMeta.label}
              </Text>
              <Text style={s.statusDesc}>{statusMeta.description}</Text>
            </VStack>
          </HStack>
        </Surface>

        <Surface elevation={0} style={s.containedGroup}>
          <Box style={s.sectionPadding}>
            <Text style={s.groupHeader}>Property Information</Text>
            <BookingBHCard data={booking} onPress={gotoBh} />
            <Box style={{ marginTop: Spacing.md }}>
              <BookingRoomCard data={booking} onPress={gotoRoom} />
            </Box>
          </Box>
          <Divider style={s.hairline} />

          <Box style={s.sectionPadding}>
            <Text style={s.groupHeader}>Reservation Details</Text>
            <VStack space="md">
              <HStack justifyContent="space-between" alignItems="center">
                <Text style={s.metaLabel}>Reference ID</Text>
                <Text style={s.metaValueMono}>{booking.reference}</Text>
              </HStack>
              <Divider style={s.hairlineLight} />
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
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </Text>
                </VStack>
              </HStack>
              <Box style={s.metaFooter}>
                <Text style={s.metaFooterText}>
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            </VStack>
          </Box>
        </Surface>

        <VStack space="xs">
          <Text style={s.groupHeader}>Digital Agreement</Text>
          <BookingAgreementBlock bookingId={bookId} viewerRole={role} />
        </VStack>

        <VStack space="xs">
          <Text style={s.groupHeader}>Contacts</Text>
          <UserInformationCard user={userData} />
        </VStack>

        <VStack space="sm">
          <Text style={s.groupHeader}>Management</Text>
          <Surface elevation={0} style={s.actionSurface}>
            <BookingDecisionBlock
              booking={booking}
              viewerRole={role}
              refundPreview={refundPreview}
              isRefundLoading={isRefundLoading}
              onApproveExtension={handleApproveExtension}
              onRejectExtension={handleRejectExtension}
              extensionRequest={bookingStatus?.extensionRequest ?? null}
              onApprove={handleApprove}
              onRequestExtension={handleRequestExtension}
              isLoading={isActionLoading}
              onReject={async (reason) => {
                await rejectBooking({
                  id: bookId,
                  payload: { ownerId: userId, reason },
                }).unwrap();

                refetch();
                refetchStatus();
                refundPreviewRefetch();
              }}
              onCancel={async (reason) => {
                await cancelBooking({
                  id: bookId,
                  payload: { userId, role, reason },
                }).unwrap();

                refetch();
                refetchStatus();
                refundPreviewRefetch();
              }}
            />
            {/* <BookingPaymentBlock
              booking={booking}
              bookingStatus={bookingStatus}
              viewerRole={role}
              onPayNow={handlePayNow}
            /> */}
            <BookingPaymentBlock
              booking={booking}
              bookingStatus={bookingStatus}
              billingStatements={billingStatements}
              isBillingStatementsLoading={isBillingStatementsLoading}
              viewerRole={role}
              onPayNow={handlePayNow}
              onViewBillingStatement={handleViewBillingStatement}
            />
          </Surface>
        </VStack>
        <PlatformGuidelines />
      </VStack>

      <Portal>
        <Modal
          visible={errorModalVisible}
          onDismiss={() => setErrorModalVisible(false)}
          contentContainerStyle={s.modalContainer}
        >
          <VStack space="md" style={s.modalContent}>
            <Box style={s.errorIconCircle}>
              <Icon
                source="alert-circle-outline"
                color={theme.colors.error}
                size={32}
              />
            </Box>
            <VStack space="xs" alignItems="center">
              <Text style={s.modalTitle}>Action Required</Text>
              <Text style={s.modalSubtitle}>{errorMessage}</Text>
            </VStack>
            <Divider style={s.hairline} />
            <Button
              mode="contained"
              buttonColor={theme.colors.error}
              textColor="#FFF"
              onPress={() => setErrorModalVisible(false)}
              style={s.modalButton}
              labelStyle={s.buttonLabel}
            >
              I Understand
            </Button>
          </VStack>
        </Modal>
      </Portal>

      {checkoutUrl && (
        <PayMongoWebView
          visible={showWebView}
          checkoutUrl={checkoutUrl}
          onClose={() => setShowWebView(false)}
          onSuccess={() => {
            setShowWebView(false);
            refetch();
            refetchStatus();
            refundPreviewRefetch();
          }}
          onCancel={() => setShowWebView(false)}
        />
      )}

      <Portal>
        <Modal
          visible={showBillingStatementWebView}
          onDismiss={() => setShowBillingStatementWebView(false)}
          contentContainerStyle={s.billingWebViewModalContainer}
        >
          <Surface elevation={0} style={s.billingWebViewSheet}>
            <HStack
              justifyContent="space-between"
              alignItems="center"
              style={s.billingWebViewHeader}
            >
              <VStack>
                <Text style={s.billingWebViewTitle}>Billing Statement</Text>
                <Text style={s.billingWebViewSubtitle}>
                  Generated booking charge summary
                </Text>
              </VStack>

              <Button
                mode="text"
                compact
                onPress={() => setShowBillingStatementWebView(false)}
                labelStyle={s.buttonLabel}
              >
                Close
              </Button>
            </HStack>

            <Divider style={s.hairlineLight} />

            <View style={s.billingWebViewBody}>
              {billingStatementUrl && (
                <WebView
                  source={{ uri: billingStatementUrl }}
                  startInLoadingState
                  style={s.billingWebView}
                />
              )}
            </View>
          </Surface>
        </Modal>
      </Portal>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainWrapper: {
    paddingBottom: Spacing.lg,
  },
  statusHeader: {
    padding: Spacing.md,
    borderRadius: 12,
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
  containedGroup: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
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
    color: "#767474",
  },
  metaValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#1A1A1A",
    marginTop: 2,
  },
  metaValueMono: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#357FC1",
    backgroundColor: "#D6ECFA",
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
  hairline: {
    height: 1,
    backgroundColor: "#CCCCCC",
  },
  hairlineLight: {
    height: 1,
    backgroundColor: "#F0F0F5",
    marginVertical: 4,
  },
  actionSurface: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    padding: Spacing.md,
  },
  // Modal Specific Styles
  modalContainer: {
    backgroundColor: "transparent",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    padding: Spacing.lg,
    alignItems: "center",
    elevation: 4,
  },
  errorIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D645451A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1A1A1A",
  },
  modalSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#767474",
    textAlign: "center",
    lineHeight: 20,
  },
  modalButton: {
    width: "100%",
    borderRadius: 8,
    marginTop: 8,
  },
  buttonLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  billingWebViewModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  billingWebViewSheet: {
    height: "92%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    overflow: "hidden",
  },
  billingWebViewHeader: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  billingWebViewTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#1A1A1A",
  },
  billingWebViewSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
  },
  billingWebViewBody: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  billingWebView: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
});
