import { View, Text, StyleSheet, Alert, Image, Pressable } from "react-native";
import React from "react";
import { Box, Button, VStack } from "@gluestack-ui/themed";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import RenderStateView from "../RenderStateView";
import {
  useCancelBookingMutation,
  useCreatePaymentProofMutation,
  useGetOneQuery,
} from "@/infrastructure/booking/booking.redux.api";
import { Ionicons } from "@expo/vector-icons";
import useTenantBookingProgressHook from "./config";
import { AppImageFile } from "@/infrastructure/image/image.schema";
import DecisionModal from "@/components/ui/DecisionModal";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";
import AutoExpandingInput from "@/components/ui/AutoExpandingInputComponent";
import PressableImagePicker from "@/components/ui/ImageComponentUtilities/PressableImagePicker";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import Container from "@/components/layout/Container/Container";

export interface TenantBookingProgressProps {
  bookingId: number;
  tenantId: number;
}

export default function TenantBookingProgress({
  bookingId,
  tenantId,
}: TenantBookingProgressProps) {
  //* States
  const [cancelBookingMessage, setCancelBookingMessage] = React.useState("");
  const [isMessageBoxVisible, setIsMessageBoxVisible] = React.useState(false);
  const [isPaymentFormInputVisible, setPaymentFormInputVisible] =
    React.useState(false);
  const [paymentMessage, setPaymentMessage] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  //* Queries & Mutations
  const {
    data: bookingData,
    isLoading: isBookingLoading,
    isError: isBookingError,
    refetch: refetchBookingData,
  } = useGetOneQuery(bookingId);

  const { initialApprovalState, completedState, paymentState } =
    useTenantBookingProgressHook(bookingData) || {};

  const [
    createPayment,
    {
      isLoading: isCreatePaymentLoading,
      isError: isCreatePaymentError,
      isSuccess: isCreatePaymentSuccess,
    },
  ] = useCreatePaymentProofMutation();

  const [
    cancelBookingAction,
    {
      isLoading: isCancelBookingLoading,
      isError: isCancelBookingError,
      isSuccess: isCancelBookingSuccess,
    },
  ] = useCancelBookingMutation();

  const { showModal } = useDecisionModal();

  //* Handlers and Logic
  const [pickedImage, setPickedImage] = React.useState<AppImageFile>();

  const handleSubmitPaymentProof = async (answer: boolean) => {
    if (!answer) return setPaymentFormInputVisible((prev) => !prev);
    if (!pickedImage && !paymentMessage) return Alert.alert("No image Picked!");
    console.log("pick me up?", pickedImage);

    if (answer) {
      // make final decision
      showModal({
        title: "Confirm Payment Receipt?",
        cancelText: "Cancel",
        confirmText: "Send Payment Proof",
        message:
          "Are you sure about this payment proof? Once sent, the owner will be notified and the booking will be completed.",
        onConfirm: async () => {
          try {
            const res = await createPayment({
              id: bookingId,
              payload: {
                tenantId,
                note: paymentMessage,
                paymentImage: pickedImage!,
              },
            }).unwrap();

            refetchBookingData();
            console.log("Sent Payment Proof:", res);
            Alert.alert("Payment Proof Sent successfully!");
          } catch (e) {
            console.log(e);
            Alert.alert("Something went wrong while senting payment proof.");
          }
        },
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    refetchBookingData();
    setRefreshing(false);
  };

  return (
    <Container
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={{
        gap: 10,
        padding: 10,
      }}
    >
      {isCreatePaymentLoading && <FullScreenLoaderAnimated /> &&
        isCancelBookingLoading &&
        isBookingLoading}
      <DecisionModal visible={isMessageBoxVisible} />
      <RenderStateView onAction={() => {}} state={initialApprovalState} />
      {/* Payment Reciept */}
      <RenderStateView
        onAction={handleSubmitPaymentProof}
        state={paymentState}
        confirmDisplayMessage="Send Payment"
        confirmButtonStyle={{
          container: {
            display: isPaymentFormInputVisible ? "flex" : "none",
          },
        }}
        rejectDisplayMessage="Clear"
        rejectButtonStyle={{
          container: {
            display: isPaymentFormInputVisible ? "flex" : "none",
          },
        }}
        lockedStateContent={
          <View
            style={{
              gap: 10,
            }}
          >
            {isPaymentFormInputVisible && (
              <>
                <PressableImagePicker
                  pickImage={setPickedImage}
                  removeImage={() => setPickedImage(undefined)}
                />
                <AutoExpandingInput
                  style={s.Form_Input_Placeholder}
                  value={paymentMessage}
                  onChangeText={setPaymentMessage}
                  placeholder=""
                  maxHeight={180}
                />
              </>
            )}
            {!isPaymentFormInputVisible && (
              <Button
                onPress={() => setPaymentFormInputVisible((prev) => !prev)}
                size="xs"
                style={[s.buttonStyle]}
              >
                <Text style={[s.textColor]}>Submit Payment Receipt</Text>
              </Button>
            )}
          </View>
        }
      />
      {/* Completed */}
      <RenderStateView onAction={() => {}} state={completedState} />
    </Container>
  );
}

const s = StyleSheet.create({
  input: {
    paddingTop: 10,
    paddingBottom: 10,
    overflow: "scroll", // Ensure scrollbar appears
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
  pickImageStyle: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageStyle: {
    backgroundColor: Colors.PrimaryLight[8],
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: BorderRadius.circle,
    padding: 2,
  },
  buttonStyle: {
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.PrimaryLight[6],
  },

  textColor: {
    color: Colors.TextInverse[2],
  },
});
