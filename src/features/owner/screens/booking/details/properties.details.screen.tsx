import { View, Text, StyleSheet, Alert, TextInput } from "react-native";
import React, { useEffect } from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Box, Button, VStack } from "@gluestack-ui/themed";
import { Colors, Fontsize, GlobalStyle, Spacing } from "@/constants";
import { useGetOneQuery } from "@/infrastructure/booking/booking.redux.api";
import { parseIsoDate } from "@/infrastructure/utils/parseISODate.util";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import { RouteProp, useRoute } from "@react-navigation/native";
import { OwnerBookingStackParamList } from "../navigation/booking.types";
import OwnerBookingProgress from "@/features/shared/booking-progress/owner-booking-progress/owner.booking-progress";
import { useSelector } from "react-redux";
import { RootState } from "@/application/store/stores";
import Container from "@/components/layout/Container/Container";

export default function PropertiesDetailsScreen({ route: routeVal }) {
  const route = routeVal;
  console.log(route);
  const [refreshing, setRefreshing] = React.useState(false);
  const [childRefresh, setChildRefresh] = React.useState();

  if (!route.params?.bookId) {
    throw new Error("Missing required parameter: Room ID");
  }

  const ownerId = useSelector(
    (state: RootState) => state.owners.selectedUser?.id
  );

  if (!ownerId) return Alert.alert("Something went wrong");
  const { bookId } = route.params;
  const {
    data: bookingData,
    isLoading: isBookingDataLoading,
    isError: isBookingDataError,
    refetch: refetchBookingData,
  } = useGetOneQuery(bookId);

  useEffect(() => {
    console.log(bookingData);
  }, [bookingData]);

  const handleTopRefreshPage = async () => {
    setRefreshing(true);
    refetchBookingData();
    await new Promise((resolve) => setTimeout(resolve, 100));
    setRefreshing(false);
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.container]}
      contentContainerStyle={[GlobalStyle.GlobalsContainer]}
    >
      {isBookingDataLoading && <FullScreenLoaderAnimated />}
      {isBookingDataError && <FullScreenErrorModal />}
      <Container refreshing={refreshing} onRefresh={handleTopRefreshPage}>
        <Box>
          <Text style={[s.textColor, { fontSize: Fontsize.display1 }]}>
            Booking Details
          </Text>
        </Box>
        <Box>
          <Text style={[s.textColor]}>
            Check In: {parseIsoDate(bookingData?.checkInDate)?.monthName}{" "}
            {parseIsoDate(bookingData?.checkInDate)?.day}{" "}
            {parseIsoDate(bookingData?.checkInDate)?.dayName}
          </Text>
          <Text style={[s.textColor]}>
            Check Out: {parseIsoDate(bookingData?.checkOutDate)?.monthName}{" "}
            {parseIsoDate(bookingData?.checkOutDate)?.day}{" "}
            {parseIsoDate(bookingData?.checkOutDate)?.dayName}
          </Text>
          <Text style={[s.textColor]}>{bookingData?.reference}</Text>
          <Text style={[s.textColor]}>{bookingData?.id}</Text>
        </Box>
        <Box>
          <Text style={[s.textColor]}>{bookingData?.tenant?.username}</Text>
          <Text style={[s.textColor]}>
            {bookingData?.tenant?.firstname ?? "no value"}
          </Text>
          <Text style={[s.textColor]}>
            {bookingData?.tenant?.lastname ?? "no value"}
          </Text>
          <Text style={[s.textColor]}>{bookingData?.tenant?.email}</Text>
          <Text style={[s.textColor]}>{bookingData?.status}</Text>
        </Box>
        <Box style={[{ gap: Spacing.md }]}>
          {bookingData && (
            <OwnerBookingProgress
              bookingId={bookingData?.id}
              ownerId={ownerId}
              refresh={refreshing}
            />
          )}
        </Box>
      </Container>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  textColor: {
    color: Colors.TextInverse[2],
  },
});
