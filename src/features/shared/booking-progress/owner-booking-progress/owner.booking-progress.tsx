import { View, Text, StyleSheet, Image, Alert } from "react-native";
import React from "react";
import { Box, Button, VStack } from "@gluestack-ui/themed";
import {
  useGetOneQuery,
  useGetPaymentProofQuery,
  usePatchApproveBookingMutation,
  usePatchRejectBookingMutation,
  usePatchVerifyPaymentMutation,
} from "@/infrastructure/booking/booking.redux.api";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";

import RenderStateView from "../RenderStateView";
import useOwnertBookingProgress from "./config";
import AutoExpandingInput from "@/components/ui/AutoExpandingInputComponent";
import DecisionModal from "@/components/ui/DecisionModal";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import FullScreenLoaderAnimated from "../../../../components/ui/FullScreenLoaderAnimated";

export interface OwnerBookingProgressProps {
  bookingId: number;
  ownerId: number;
  refresh?: boolean;
}

export default function OwnerBookingProgress({
  bookingId,
  ownerId,
  refresh,
}: OwnerBookingProgressProps) {
  //* 1. STATE
  const [rejectApproveMessage, setRejectApproveMessage] = React.useState("");
  const [paymentMessage, setPaymentMessage] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isMessageBoxVisible, setIsMessageBoxVisible] = React.useState(false);
  const [isMessageInputVisible, setMessageInputVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(refresh);

  //* 2. QUERIES & MUTATIONS — ALL UNCONDITIONAL
  const {
    data: bookingProgress,
    refetch: refetchBookingData,
    isLoading: isBookingProgressLoading,
  } = useGetOneQuery(bookingId);
  const {
    data: imageData,
    isError: isImageDataError,
    isLoading: isIMageDataLoading,
    error: imageDataError,
    refetch: refetchImageData,
  } = useGetPaymentProofQuery(+bookingProgress?.paymentProofId!);

  const { initialApprovalState, paymentState, completedState } =
    useOwnertBookingProgress(bookingProgress) ?? {};

  const [
    approveAction,
    {
      isLoading: isApproveActionLoading,
      isError: isApproveActionError,
      isSuccess: isApproveActionSuccess,
    },
  ] = usePatchApproveBookingMutation();
  const [rejectAction] = usePatchRejectBookingMutation();
  const [verifyPaymentAction, { isLoading: isVerifyPaymentActionLoading }] =
    usePatchVerifyPaymentMutation(); // ← MUST be here
  const { showModal } = useDecisionModal();
  // const {} = use

  if (!completedState) {
    return null;
  }

  //* 3. HANDLERS — defined AFTER all hooks
  const handleRejectApproveAction = (answer: boolean) => {
    if (answer) {
      showModal({
        title: "Confirm Booking Approval",
        cancelText: "Cancel",
        confirmText: "Approve Booking",
        message:
          "Are you sure you want to approve this booking request? Once approved, the tenant will be notified and the booking will be confirmed.",
        onConfirm: async () => {
          try {
            const res = await approveAction({
              id: bookingId,
              payload: { ownerId, message: rejectApproveMessage },
            }).unwrap();

            refetchBookingData();
            console.log("Approve response:", res);
            Alert.alert("Booking approved successfully!");
          } catch (e) {
            console.log(e);
            Alert.alert("Something went wrong while approving booking.");
          }
        },
      });
    } else {
      showModal({
        title: "Reject Booking Request",
        cancelText: "Cancel",
        confirmText: "Reject Booking",
        message:
          "Do you really want to reject this booking? This action cannot be undone, and the tenant will be notified of the rejection.",
        onConfirm: async () => {
          try {
            const res = await rejectAction({
              id: bookingId,
              payload: { ownerId, reason: rejectApproveMessage },
            }).unwrap();
            refetchBookingData();
            console.log("Reject response:", res);
            Alert.alert("Booking rejected successfully!");
          } catch (e) {
            console.log(e);
            Alert.alert("Something went wrong while approving booking.");
          }
        },
      });
    }
  };

  const handlePaymentAction = (approve: boolean) => {
    const title = approve
      ? "Confirm Booking Payment"
      : "Reject Booking Request";
    const confirmText = approve ? "Approve Booking" : "Reject Booking";
    const message = approve
      ? "Are you sure you want to approve this booking request? Once approved, the tenant will be notified and the booking will be confirmed."
      : "Do you really want to reject this booking? This action cannot be undone, and the tenant will be notified of the rejection.";

    showModal({
      title,
      cancelText: "Cancel",
      confirmText,
      message,
      onConfirm: async () => {
        try {
          const newStatus = approve ? "COMPLETED_BOOKING" : "REJECTED_BOOKING";

          const res = await verifyPaymentAction({
            id: bookingId,
            payload: { ownerId, remarks: paymentMessage, newStatus },
          }).unwrap();

          refetchBookingData();
          Alert.alert(
            approve
              ? "Booking approved successfully!"
              : "Booking rejected successfully!",
          );
          console.log(`${approve ? "Approve" : "Reject"} response:`, res);
        } catch (err) {
          console.error(err);
          Alert.alert("Something went wrong while processing booking.");
        }
      },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    refetchBookingData();
    refetchImageData();
    setRefreshing(false);
  };

  React.useEffect(() => {
    if (refresh) {
      handleRefresh();
    }
  }, [refresh]);

  // 4. RENDER
  return (
    <View style={[s.container]}>
      <DecisionModal visible={isMessageBoxVisible} />
      {isIMageDataLoading &&
        isApproveActionLoading &&
        isVerifyPaymentActionLoading &&
        isBookingProgressLoading && <FullScreenLoaderAnimated />}
      <Text style={[s.textColor, { fontSize: Fontsize.display1 }]}>
        Booking Progress
      </Text>
      {/* initial State */}
      <RenderStateView
        onAction={handleRejectApproveAction}
        state={initialApprovalState}
        lockedStateContent={
          <Box style={{ gap: Spacing.md }}>
            <Text style={[s.textColor, { fontSize: Fontsize.h1 }]}>
              Booking Request
            </Text>
            {isMessageInputVisible && (
              <AutoExpandingInput
                style={s.Form_Input_Placeholder}
                value={message}
                onChangeText={setMessage}
                placeholder=""
                maxHeight={180} // optional, default 200
              />
            )}
            <Button
              onPress={() => setMessageInputVisible((prev) => !prev)}
              size="xs"
              style={[s.buttonStyle]}
            >
              <Text style={[s.textColor]}>Show Message Box</Text>
            </Button>
          </Box>
        }
      />
      {/* initial State */}
      {/* payment State */}
      <RenderStateView
        onAction={handlePaymentAction}
        state={paymentState}
        confirmDisplayMessage="Approve"
        lockedStateContent={
          <>
            {imageData && (
              <>
                <PressableImageFullscreen
                  image={imageData}
                  imageStyleConfig={{
                    containerStyle: { height: 200 },
                    resizeMode: "cover",
                    // imageStyleProps: ,
                  }}
                />
                <AutoExpandingInput
                  style={s.Form_Input_Placeholder}
                  value={paymentMessage}
                  onChangeText={setPaymentMessage}
                  placeholder="Payment remarks or reason"
                  maxHeight={180} // optional, default 200
                />
              </>
            )}
          </>
        }
      />
      {/* payment State */}
      {/* Completed State */}
      <RenderStateView onAction={() => {}} state={completedState} />
      {/* Completed State */}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.PrimaryLight[9],
    shadowColor: Colors.PrimaryLight[10],
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 4.15,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: BorderRadius.md,

    gap: Spacing.lg,
    padding: Spacing.sm,
  },
  Form_Input_Placeholder: {
    backgroundColor: Colors.PrimaryLight[6],
    color: Colors.TextInverse[2],
    fontSize: Fontsize.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonStyle: {
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.PrimaryLight[6],
  },

  textColor: {
    color: Colors.TextInverse[2],
  },
});
