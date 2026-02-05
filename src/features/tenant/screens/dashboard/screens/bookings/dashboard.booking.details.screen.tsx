import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import React from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { TenantDashboardBookingStackParamList } from "./navigation/bookings.stack";
import {
  useCancelBookingMutation,
  useGetOneQuery,
} from "@/infrastructure/booking/booking.redux.api";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Box, Button, VStack } from "@gluestack-ui/themed";
import TenantBookingProgress from "@/features/shared/booking-progress/tenant-booking-progress/tenant.booking-progress";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { expoStorageCleaner } from "@/infrastructure/utils/expo-utils/expo-utils.service";
import Container from "@/components/layout/Container/Container";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";
import DecisionModal from "@/components/ui/DecisionModal";
import AutoExpandingInput from "@/components/ui/AutoExpandingInputComponent";

type RouteProps = RouteProp<
  TenantDashboardBookingStackParamList,
  "DashboardBookingDetailsScreen"
>;

export default function DashboardBookingDetailsScreen() {
  React.useEffect(() => {
    return () => {
      expoStorageCleaner(["documents", "images"]);
    };
  }, []);

  const [refreshing, setRefreshing] = React.useState(false);
  const [isMessageBoxVisible, setIsMessageBoxVisible] = React.useState(false);
  const [cancelationMessage, setCancellationMessage] = React.useState("");

  const { showModal } = useDecisionModal();

  const [
    cancelBooking,
    { isError: isCalcelBookingError, isLoading: isCancelBookingLoading },
  ] = useCancelBookingMutation();

  const route = useRoute<RouteProps>();
  const { bookId } = route.params;

  const {
    data: bookingData,
    isLoading: isBookingDataLoading,
    isError: isBookingDataError,
    refetch: refetchBookingData,
  } = useGetOneQuery(bookId);
  const tenantIdForBooking = bookingData?.tenantId;

  const handleTopRefreshPage = async () => {
    setRefreshing(true);
    refetchBookingData();
    await new Promise((resolve) => setTimeout(resolve, 100));
    setRefreshing(false);
  };

  const handleCancelBookingButton = () => {
    if (!bookId) return Alert.alert("Something went wrong");
    if (!tenantIdForBooking) return Alert.alert("Something went wrong");

    showModal({
      title: "Cancel Booking",
      message: "Are you sure you want to cancel this booking?",
      onConfirm: () => {
        cancelBooking({
          id: bookId,
          payload: {
            reason: cancelationMessage,
            userId: tenantIdForBooking,
            role: "TENANT",
          },
        });
      },
      onCancel: () => {
        setIsMessageBoxVisible(false);
      },
      containerStyle: {
        borderWidth: 0,
      },
      children: () => (
        <AutoExpandingInput
          style={s.Form_Input_Placeholder}
          value={cancelationMessage}
          onChangeText={setCancellationMessage}
          maxHeight={180}
          placeholder=""
        />
      ),
    });
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.container]}
      contentContainerStyle={[GlobalStyle.GlobalsContainer]}
    >
      {isBookingDataLoading && <FullScreenLoaderAnimated />}
      <Container refreshing={refreshing} onRefresh={handleTopRefreshPage}>
        <VStack>
          {tenantIdForBooking && (
            <Box>
              <TenantBookingProgress
                bookingId={bookId}
                tenantId={tenantIdForBooking}
              />
            </Box>
          )}
        </VStack>
        <Button onPress={handleCancelBookingButton}>
          <Text>Cancel Booking</Text>
        </Button>
      </Container>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },

  Form_Input_Placeholder: {
    backgroundColor: Colors.PrimaryLight[6],
    color: Colors.TextInverse[2],
    height: 200,
    fontSize: Fontsize.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {},
});
