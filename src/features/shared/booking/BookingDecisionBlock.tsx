import React from "react";
import { View, StyleSheet, Vibration, Platform } from "react-native";
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
  ActivityIndicator,
} from "react-native-paper";
import {
  GetBooking,
  RefundPreview,
} from "@/infrastructure/booking/booking.schema";
import { Spacing } from "@/constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import { VStack, HStack, Box } from "@gluestack-ui/themed";
import {
  useGetOwnerAccessQuery,
  useGetTenantAccessQuery,
} from "@/infrastructure/access/access.redux.api";
import {
  isOwnerAccess,
  isTenantAccess,
} from "@/infrastructure/access/access.schema";

type ApproveBookingForm = {
  message?: string;
  reservationFee: number;
  advancePayment: number;
  securityDeposit: number;
};

interface BookingDecisionBlockInterface {
  booking: GetBooking;
  viewerRole: "TENANT" | "OWNER";
  onApprove: (payload: ApproveBookingForm) => void;
  onReject: (reason: string) => void;
  onCancel: (reason: string) => void;
  onVerifyPayment?: () => void;
  onRequestExtension?: (payload: {
    requestedCheckOutDate: string;
    reason?: string;
  }) => void;
  refundPreview?: RefundPreview | null;
  isRefundLoading?: boolean;
  isLoading?: boolean;
  extensionRequest?: {
    id: number;
    bookingId: number;
    tenantId: number;
    ownerId: number;
    currentCheckOutDate: string;
    requestedCheckOutDate: string;
    status:
      | "PENDING"
      | "APPROVED_AWAITING_PAYMENT"
      | "REJECTED"
      | "PAID"
      | "CANCELLED";
    reason?: string | null;
    ownerMessage?: string | null;
    extensionChargeId?: number | null;
    approvedAt?: string | null;
    paidAt?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;

  onApproveExtension?: (payload: {
    extensionId: number;
    extensionAmount: number;
    message?: string;
  }) => void;

  onRejectExtension?: (payload: {
    extensionId: number;
    reason?: string;
  }) => void;
}

export default function BookingDecisionBlock({
  booking,
  viewerRole,
  onApprove,
  onReject,
  onCancel,
  onVerifyPayment,
  onApproveExtension,
  onRejectExtension,
  refundPreview,
  isRefundLoading,
  extensionRequest,
  onRequestExtension,
  isLoading: isActionLoading,
}: BookingDecisionBlockInterface) {
  const theme = useTheme();
  // const [message, setMessage] = React.useState("");
  // const [showConfirm, setShowConfirm] = React.useState(false);

  //! new booking implemenation
  const [message, setMessage] = React.useState("");
  const [reservationFee, setReservationFee] = React.useState("0");
  const [advancePayment, setAdvancePayment] = React.useState(
    String(booking.room.price ?? 0),
  );
  const [securityDeposit, setSecurityDeposit] = React.useState("0");
  //! new booking implemenation

  const [showRefundConfirm, setShowRefundConfirm] = React.useState(false);
  const [showExtensionModal, setShowExtensionModal] = React.useState(false);
  const [showExtensionDatePicker, setShowExtensionDatePicker] =
    React.useState(false);
  // const [extensionReason, setExtensionReason] = React.useState("");
  const extensionReasonRef = React.useRef("");
  // const extensionAmountRef = React.useRef("");
  const extensionAmountRef = React.useRef(String(booking.room.price ?? 0));
  const ownerExtensionMessageRef = React.useRef("");
  const ownerRejectReasonRef = React.useRef("");
  // const [extensionAmount, setExtensionAmount] = React.useState("");
  // const [ownerExtensionMessage, setOwnerExtensionMessage] = React.useState("");
  // const [ownerRejectReason, setOwnerRejectReason] = React.useState("");

  const [showApproveExtensionModal, setShowApproveExtensionModal] =
    React.useState(false);
  const [showRejectExtensionModal, setShowRejectExtensionModal] =
    React.useState(false);
  // const [extensionAmount, setExtensionAmount] = React.useState("");
  // const [ownerExtensionMessage, setOwnerExtensionMessage] = React.useState("");
  // const [ownerRejectReason, setOwnerRejectReason] = React.useState("");

  const currentCheckOutDate = React.useMemo(
    () => new Date(booking.checkOutDate),
    [booking.checkOutDate],
  );

  const buildExtensionDate = React.useCallback(
    (date: Date) => {
      const next = new Date(date);
      next.setHours(
        currentCheckOutDate.getHours(),
        currentCheckOutDate.getMinutes(),
        currentCheckOutDate.getSeconds(),
        currentCheckOutDate.getMilliseconds(),
      );
      return next;
    },
    [currentCheckOutDate],
  );

  const minimumExtensionDate = React.useMemo(() => {
    const nextDay = new Date(currentCheckOutDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return buildExtensionDate(nextDay);
  }, [buildExtensionDate, currentCheckOutDate]);

  const [requestedCheckOutDate, setRequestedCheckOutDate] =
    React.useState<Date>(minimumExtensionDate);

  React.useEffect(() => {
    setRequestedCheckOutDate(minimumExtensionDate);
  }, [minimumExtensionDate]);

  const handleExtensionDateChange = (_event: any, selectedDate?: Date) => {
    setShowExtensionDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      setRequestedCheckOutDate(buildExtensionDate(selectedDate));
    }
  };

  //! new booking implemenation
  // const tenantId = booking.room.boardingHouse.ownerId;
  // const ownerId = booking.tenantId;
  const tenantId = booking.tenantId;
  const ownerId = booking.room.boardingHouse.ownerId;
  //! new booking implemenation

  // 1. DYNAMIC DATA FETCHING
  // Select hook based on role. Owner needs ownerId, Tenant needs tenantId.
  const ownerQuery = useGetOwnerAccessQuery(
    { id: ownerId },
    { skip: viewerRole !== "OWNER" || !ownerId },
  );
  const tenantQuery = useGetTenantAccessQuery(
    { id: tenantId },
    { skip: viewerRole !== "TENANT" || !tenantId },
  );

  const accessData =
    viewerRole === "OWNER" ? ownerQuery.data : tenantQuery.data;
  const isAccessLoading =
    viewerRole === "OWNER" ? ownerQuery.isLoading : tenantQuery.isLoading;

  console.log("access data booking status page: ", accessData);

  // 2. LOCKDOWN LOGIC
  const lockdown = React.useMemo(() => {
    if (!accessData) return false;
    if (viewerRole === "OWNER" && isOwnerAccess(accessData)) {
      // Owners are locked if they can't approve bookings
      return !accessData.canApproveBookings;
    }
    if (viewerRole === "TENANT" && isTenantAccess(accessData)) {
      // Tenants are locked if they can't book (usually means verification pending)
      return !accessData.canBookRoom;
    }
    return false;
  }, [accessData, viewerRole]);

  const handlePress = (pattern: "light" | "heavy", action: () => void) => {
    Vibration.vibrate(pattern === "heavy" ? 40 : 10);
    action();
  };

  // 3. UI STATES
  if (isAccessLoading) {
    return (
      <ActivityIndicator animating={true} style={{ marginVertical: 20 }} />
    );
  }

  if (lockdown) {
    return (
      <Surface elevation={0} style={s.lockdownCard}>
        <HStack space="md" alignItems="center">
          <Box style={s.lockIconBg}>
            <Icon
              source="shield-alert-outline"
              size={22}
              color={theme.colors.error}
            />
          </Box>
          <VStack style={{ flex: 1 }}>
            <Text style={s.lockTitle}>Action Restricted</Text>
            <Text style={s.lockSub}>
              {viewerRole === "OWNER"
                ? "Complete verification to manage this booking."
                : "Verify your account to perform booking actions."}
            </Text>
          </VStack>
        </HStack>
      </Surface>
    );
  }

  // --- EXISTING LOGIC STARTS HERE ---
  const { status } = booking;
  const isOwner = viewerRole === "OWNER";
  const isTenant = viewerRole === "TENANT";
  const now = new Date();
  const hasOpenExtensionRequest =
    extensionRequest?.status === "PENDING" ||
    extensionRequest?.status === "APPROVED_AWAITING_PAYMENT";

  const canRequestExtension =
    isTenant &&
    status === "COMPLETED_BOOKING" &&
    new Date(booking.checkOutDate) > now &&
    !hasOpenExtensionRequest;

  const showRefundUI = status === "COMPLETED_BOOKING" && !!refundPreview;
  const isLoading = isActionLoading || isAccessLoading;

  if (isOwner && status === "PENDING_REQUEST") {
    return (
      <VStack space="md" style={{ opacity: isLoading ? 0.7 : 1 }}>
        <TextInput
          mode="outlined"
          label="Note to Tenant (Optional)"
          value={message}
          onChangeText={setMessage}
          style={s.input}
          disabled={isLoading}
        />

        <TextInput
          mode="outlined"
          label="Reservation Fee"
          value={reservationFee}
          onChangeText={setReservationFee}
          keyboardType="numeric"
          style={s.input}
          disabled={isLoading}
        />

        <TextInput
          mode="outlined"
          label="Advance Payment"
          value={advancePayment}
          onChangeText={setAdvancePayment}
          keyboardType="numeric"
          style={s.input}
          disabled={isLoading}
        />

        <TextInput
          mode="outlined"
          label="Security Deposit"
          value={securityDeposit}
          onChangeText={setSecurityDeposit}
          keyboardType="numeric"
          style={s.input}
          disabled={isLoading}
        />

        <HelperText type="info">
          Reservation fee will be deducted from the advance payment for move-in.
        </HelperText>

        <HStack space="sm">
          <Button
            mode="contained"
            onPress={() =>
              handlePress("light", () =>
                onApprove({
                  message,
                  reservationFee: Number(reservationFee || 0),
                  advancePayment: Number(advancePayment || 0),
                  securityDeposit: Number(securityDeposit || 0),
                }),
              )
            }
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

  if (isOwner && status === "COMPLETED_BOOKING" && extensionRequest) {
    const requestedDateText = new Date(
      extensionRequest.requestedCheckOutDate,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const currentDateText = new Date(
      extensionRequest.currentCheckOutDate,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (extensionRequest.status === "PENDING") {
      return (
        <>
          <Surface elevation={0} style={s.extensionOwnerCard}>
            <VStack space="md">
              <HStack space="sm" alignItems="center">
                <Box style={s.extensionStateIconBg}>
                  <Icon
                    source="calendar-clock-outline"
                    size={20}
                    color={theme.colors.secondary}
                  />
                </Box>
                <VStack style={{ flex: 1 }}>
                  <Text style={s.extensionStateTitle}>
                    Extension Request Pending
                  </Text>
                  <Text style={s.extensionStateSubtitle}>
                    The tenant requested to extend this stay.
                  </Text>
                </VStack>
              </HStack>

              <VStack space="xs">
                <Text style={s.extensionMetaText}>
                  Current checkout: {currentDateText}
                </Text>
                <Text style={s.extensionMetaText}>
                  Requested checkout: {requestedDateText}
                </Text>
                {!!extensionRequest.reason && (
                  <Text style={s.extensionMetaText}>
                    Tenant reason: {extensionRequest.reason}
                  </Text>
                )}
              </VStack>

              <HStack space="sm">
                <Button
                  mode="contained"
                  style={s.flexButton}
                  icon="check"
                  loading={isLoading}
                  onPress={() => {
                    extensionAmountRef.current = String(
                      booking.room.price ?? 0,
                    );
                    ownerExtensionMessageRef.current = "";
                    setShowApproveExtensionModal(true);
                  }}
                >
                  Approve Extension
                </Button>

                <Button
                  mode="outlined"
                  style={[s.flexButton, { borderColor: theme.colors.error }]}
                  textColor={theme.colors.error}
                  icon="close"
                  disabled={isLoading}
                  onPress={() => {
                    ownerRejectReasonRef.current = "";
                    setShowRejectExtensionModal(true);
                  }}
                >
                  Reject
                </Button>
              </HStack>
            </VStack>
          </Surface>

          <Portal>
            <Modal
              visible={showApproveExtensionModal && !isLoading}
              onDismiss={() => setShowApproveExtensionModal(false)}
              contentContainerStyle={s.modalContainer}
            >
              <Surface elevation={0} style={s.modalContent}>
                <VStack space="md">
                  <Text style={s.modalTitle}>Approve Extension</Text>
                  <Text style={s.modalSubtitle}>
                    Set the extension amount and optional note for the tenant.
                  </Text>

                  <TextInput
                    mode="outlined"
                    label="Extension Amount"
                    defaultValue={String(booking.room.price ?? 0)}
                    onChangeText={(text) => {
                      extensionAmountRef.current = text;
                    }}
                    keyboardType="numeric"
                    style={s.input}
                    disabled={isLoading}
                  />

                  <TextInput
                    mode="outlined"
                    label="Message (Optional)"
                    defaultValue=""
                    // value={ownerExtensionMessage}
                    onChangeText={(text) => {
                      ownerExtensionMessageRef.current = text;
                    }}
                    style={s.input}
                    disabled={isLoading}
                    multiline
                  />

                  <VStack space="sm">
                    <Button
                      mode="contained"
                      loading={isLoading}
                      onPress={() =>
                        handlePress("light", () => {
                          onApproveExtension?.({
                            extensionId: extensionRequest.id,
                            extensionAmount: Number(
                              extensionAmountRef.current || 0,
                            ),
                            message:
                              ownerExtensionMessageRef.current.trim() ||
                              undefined,
                          });
                          setShowApproveExtensionModal(false);
                        })
                      }
                    >
                      Confirm Approval
                    </Button>

                    <Button
                      mode="text"
                      disabled={isLoading}
                      onPress={() => setShowApproveExtensionModal(false)}
                    >
                      Cancel
                    </Button>
                  </VStack>
                </VStack>
              </Surface>
            </Modal>
          </Portal>

          <Portal>
            <Modal
              visible={showRejectExtensionModal && !isLoading}
              onDismiss={() => setShowRejectExtensionModal(false)}
              contentContainerStyle={s.modalContainer}
            >
              <Surface elevation={0} style={s.modalContent}>
                <VStack space="md">
                  <Text style={s.modalTitle}>Reject Extension</Text>
                  <Text style={s.modalSubtitle}>
                    Add an optional reason for rejecting this request.
                  </Text>

                  <TextInput
                    mode="outlined"
                    label="Reason (Optional)"
                    // value={ownerRejectReason}
                    onChangeText={(text) => {
                      ownerRejectReasonRef.current = text;
                    }}
                    style={[s.input, s.multilineInput]}
                    disabled={isLoading}
                    multiline
                    numberOfLines={4}
                  />

                  <VStack space="sm">
                    <Button
                      mode="contained"
                      buttonColor={theme.colors.error}
                      loading={isLoading}
                      onPress={() =>
                        handlePress("light", () => {
                          onRejectExtension?.({
                            extensionId: extensionRequest.id,
                            reason:
                              ownerRejectReasonRef.current.trim() || undefined,
                          });
                          setShowRejectExtensionModal(false);
                        })
                      }
                    >
                      Confirm Rejection
                    </Button>

                    <Button
                      mode="text"
                      disabled={isLoading}
                      onPress={() => setShowRejectExtensionModal(false)}
                    >
                      Cancel
                    </Button>
                  </VStack>
                </VStack>
              </Surface>
            </Modal>
          </Portal>
        </>
      );
    }

    if (extensionRequest.status === "APPROVED_AWAITING_PAYMENT") {
      return (
        <Surface elevation={0} style={s.extensionOwnerCard}>
          <VStack space="sm">
            <Text style={s.extensionStateTitle}>Extension Approved</Text>
            <Text style={s.extensionMetaText}>
              Requested checkout: {requestedDateText}
            </Text>
            <Text style={s.extensionStateSubtitle}>
              Waiting for tenant to pay the extension charge.
            </Text>
            {!!extensionRequest.ownerMessage && (
              <Text style={s.extensionMetaText}>
                Owner note: {extensionRequest.ownerMessage}
              </Text>
            )}
          </VStack>
        </Surface>
      );
    }

    if (extensionRequest.status === "PAID") {
      return (
        <Surface elevation={0} style={s.extensionOwnerCard}>
          <VStack space="sm">
            <Text style={s.extensionStateTitle}>Extension Completed</Text>
            <Text style={s.extensionMetaText}>
              New checkout: {requestedDateText}
            </Text>
            {!!extensionRequest.paidAt && (
              <Text style={s.extensionMetaText}>
                Paid on{" "}
                {new Date(extensionRequest.paidAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </VStack>
        </Surface>
      );
    }

    if (extensionRequest.status === "REJECTED") {
      return (
        <Surface elevation={0} style={s.extensionRejectedCard}>
          <VStack space="sm">
            <Text
              style={[s.extensionStateTitle, { color: theme.colors.error }]}
            >
              Extension Rejected
            </Text>
            <Text style={[s.extensionMetaText, { color: theme.colors.error }]}>
              Requested checkout: {requestedDateText}
            </Text>
            {!!extensionRequest.ownerMessage && (
              <Text
                style={[s.extensionMetaText, { color: theme.colors.error }]}
              >
                Reason: {extensionRequest.ownerMessage}
              </Text>
            )}
          </VStack>
        </Surface>
      );
    }

    if (extensionRequest.status === "CANCELLED") {
      return (
        <Surface elevation={0} style={s.extensionOwnerCard}>
          <VStack space="sm">
            <Text style={s.extensionStateTitle}>Extension Cancelled</Text>
            <Text style={s.extensionMetaText}>
              Requested checkout: {requestedDateText}
            </Text>
          </VStack>
        </Surface>
      );
    }
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

        {isTenant && extensionRequest?.status === "PENDING" && (
          <Surface elevation={0} style={s.extensionStateCard}>
            <HStack space="sm" alignItems="center">
              <Box style={s.extensionStateIconBg}>
                <Icon
                  source="clock-outline"
                  size={20}
                  color={theme.colors.secondary}
                />
              </Box>
              <VStack style={{ flex: 1 }}>
                <Text style={s.extensionStateTitle}>
                  Extension Request Sent
                </Text>
                <Text style={s.extensionStateSubtitle}>
                  Waiting for owner review until{" "}
                  {new Date(
                    extensionRequest.requestedCheckOutDate,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  .
                </Text>
                {!!extensionRequest.reason && (
                  <Text style={s.extensionMetaText}>
                    Reason: {extensionRequest.reason}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Surface>
        )}

        {isTenant &&
          extensionRequest?.status === "APPROVED_AWAITING_PAYMENT" && (
            <Surface elevation={0} style={s.extensionStateCard}>
              <HStack space="sm" alignItems="center">
                <Box style={s.extensionStateIconBg}>
                  <Icon
                    source="check-decagram-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                </Box>
                <VStack style={{ flex: 1 }}>
                  <Text style={s.extensionStateTitle}>Extension Approved</Text>
                  <Text style={s.extensionStateSubtitle}>
                    Your extension was approved. Continue in the Payment section
                    to settle the extension charge.
                  </Text>
                  {!!extensionRequest.ownerMessage && (
                    <Text style={s.extensionMetaText}>
                      Owner message: {extensionRequest.ownerMessage}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Surface>
          )}

        {isTenant && extensionRequest?.status === "REJECTED" && (
          <Surface elevation={0} style={s.extensionRejectedCard}>
            <HStack space="sm" alignItems="center">
              <Icon
                source="close-circle-outline"
                size={20}
                color={theme.colors.error}
              />
              <VStack style={{ flex: 1 }}>
                <Text
                  style={[s.extensionStateTitle, { color: theme.colors.error }]}
                >
                  Extension Rejected
                </Text>
                {!!extensionRequest.ownerMessage && (
                  <Text
                    style={[s.extensionMetaText, { color: theme.colors.error }]}
                  >
                    {extensionRequest.ownerMessage}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Surface>
        )}

        {canRequestExtension && (
          <Surface elevation={0} style={s.extensionCard}>
            <HStack space="sm" alignItems="center">
              <Box style={s.extensionIconBg}>
                <Icon
                  source="calendar-plus"
                  size={22}
                  color={theme.colors.primary}
                />
              </Box>
              <VStack style={{ flex: 1 }}>
                <Text style={s.extensionTitle}>Need more time?</Text>
                <Text style={s.extensionSubtitle}>
                  You can request an extension before your current checkout
                  date.
                </Text>
              </VStack>
            </HStack>

            <Button
              mode="contained"
              icon="calendar-plus"
              style={{ marginTop: 12 }}
              onPress={() => setShowExtensionModal(true)}
              loading={isLoading}
            >
              Request Extension
            </Button>
          </Surface>
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
          onPress={() => setShowRefundConfirm(true)}
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
            visible={showRefundConfirm && !isLoading}
            onDismiss={() => setShowRefundConfirm(false)}
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
                    ? refundPreview?.refundable
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
                        setShowRefundConfirm(false);
                      })
                    }
                  >
                    Confirm{" "}
                    {status === "COMPLETED_BOOKING" ? "Refund" : "Cancellation"}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => setShowRefundConfirm(false)}
                    disabled={isLoading}
                  >
                    Go Back
                  </Button>
                </VStack>
              </VStack>
            </Surface>
          </Modal>
        </Portal>

        <Portal>
          <Modal
            visible={showExtensionModal && !isLoading}
            onDismiss={() => setShowExtensionModal(false)}
            contentContainerStyle={s.modalContainer}
          >
            <Surface elevation={0} style={s.modalContent}>
              <VStack space="md">
                <HStack space="sm" alignItems="center">
                  <Box
                    style={[
                      s.iconCircle,
                      { backgroundColor: theme.colors.primary + "1A" },
                    ]}
                  >
                    <Icon
                      source="calendar-plus"
                      color={theme.colors.primary}
                      size={28}
                    />
                  </Box>
                  <VStack style={{ flex: 1 }}>
                    <Text style={s.modalTitle}>Request Extension</Text>
                    <Text style={s.modalSubtitle}>
                      Enter a new checkout date and optional reason.
                    </Text>
                  </VStack>
                </HStack>

                <VStack space="xs">
                  <Text style={s.fieldLabel}>Requested Check-Out Date</Text>

                  <Button
                    mode="outlined"
                    icon="calendar-month-outline"
                    contentStyle={s.buttonHeight}
                    onPress={() => setShowExtensionDatePicker(true)}
                    disabled={isLoading}
                    style={s.datePickerButton}
                  >
                    {requestedCheckOutDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Button>

                  <HelperText type="info" style={s.helperTight}>
                    Current checkout:{" "}
                    {currentCheckOutDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </HelperText>

                  {showExtensionDatePicker && (
                    <DateTimePicker
                      value={requestedCheckOutDate}
                      mode="date"
                      display="default"
                      onChange={handleExtensionDateChange}
                      minimumDate={minimumExtensionDate}
                    />
                  )}
                </VStack>

                {/* <TextInput
                  mode="outlined"
                  label="Reason (Optional)"
                  value={extensionReason}
                  onChangeText={setExtensionReason}
                  style={s.input}
                  disabled={isLoading}
                  multiline
                /> */}
                <TextInput
                  mode="outlined"
                  label="Reason (Optional)"
                  defaultValue=""
                  onChangeText={(text) => {
                    extensionReasonRef.current = text;
                  }}
                  style={[s.input, s.multilineInput]}
                  disabled={isLoading}
                  multiline
                  numberOfLines={4}
                />

                <VStack space="sm">
                  <Button
                    mode="contained"
                    onPress={() =>
                      handlePress("light", () => {
                        onRequestExtension?.({
                          requestedCheckOutDate:
                            requestedCheckOutDate.toISOString(),
                          reason:
                            extensionReasonRef.current.trim() || undefined,
                        });
                        setShowExtensionModal(false);
                      })
                    }
                    loading={isLoading}
                  >
                    Submit Extension Request
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => setShowExtensionModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
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
  lockdownCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D6454550",
    backgroundColor: "#FFF5F5", // Very light tint of error
    elevation: 0,
  },
  lockIconBg: {
    padding: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  lockTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#D64545",
  },
  lockSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#666",
  },
  input: {
    backgroundColor: "white",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  flexButton: { flex: 1, borderRadius: 8, elevation: 0 },

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
  buttonHeight: { height: 48 },
  buttonLabel: { fontFamily: "Poppins-SemiBold", fontSize: 14 },
  refundPercent: { fontFamily: "Poppins-Bold", fontSize: 12 },
  refundSub: { fontFamily: "Poppins-Regular", fontSize: 11, color: "#767474" },
  refundAmount: { fontFamily: "Poppins-SemiBold", fontSize: 14 },
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
  extensionCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#F7F9FC",
    marginBottom: 4,
  },
  extensionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D6ECFA",
  },
  extensionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#1A1A1A",
  },
  extensionSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#666",
  },

  fieldLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#767474",
  },
  datePickerButton: {
    borderRadius: 10,
  },
  helperTight: {
    marginTop: -2,
    marginBottom: 0,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  extensionStateCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#F7F9FC",
    marginBottom: 8,
  },
  extensionRejectedCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(214, 69, 69, 0.25)",
    backgroundColor: "#FFF5F5",
    marginBottom: 8,
  },
  extensionOwnerCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
  },
  extensionStateIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D6ECFA",
  },
  extensionStateTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#1A1A1A",
  },
  extensionStateSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#666",
  },
  extensionMetaText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
    marginTop: 2,
  },
});
