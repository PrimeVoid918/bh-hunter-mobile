import { View, Text, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";
import { Box, Button, VStack } from "@gluestack-ui/themed";

import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { useGetAllQuery } from "@/infrastructure/booking/booking.redux.api";
import { QueryBooking } from "../../../../infrastructure/booking/booking.schema";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { OwnerBookingStackParamList } from "./navigation/booking.types";
import { useGetOneQuery } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { parseIsoDate } from "@/infrastructure/utils/date-and-time/parseISODate.util";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Container from "@/components/layout/Container/Container";
import { Lists } from "@/components/layout/Lists/Lists";

type RouteProps = RouteProp<
  OwnerBookingStackParamList,
  "PropertiesBookingListsScreen"
>;

export default function PropertiesBookingListsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<OwnerBookingStackParamList>>();
  const route = useRoute<RouteProps>();
  if (!route.params?.bhId) {
    <Text>Error getting Information</Text>;
  }
  const { bhId } = route.params;

  if (!bhId) {
    Alert.alert("Something went wrong when fetching the data!");
  }

  const [refreshing, setRefreshing] = useState(false);
  const [bookingFilters, setBookingFilters] = useState<QueryBooking>({
    limit: 20,
    page: 1,
    boardingHouseId: bhId!,
  });

  const { data: bookingList, isLoading: isBookingListLoading } =
    useGetAllQuery(bookingFilters);
  const { data: boardingHouseData } = useGetOneQuery(bhId);

  const handleGotoBookingDetails = (bookId: number) => {
    console.log("togo book detalils", bookId);
    if (!bookId) {
      Alert.alert("Error", "Missing required parameter: bookId");
      return;
    }

    navigation.navigate("BookingStatusScreen", { bookId: bookId });
  };

  const handlePageRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderBookingItem = ({
    item,
  }: {
    item: (typeof bookingList)[number];
  }) => (
    <Box key={item.id} style={[styles.container]}>
      <Box style={[styles.center_item]}>
        <Text
          style={[
            styles.textColor,
            styles.item_header,
            {
              textAlign: "center",
              fontSize: Fontsize.xl,
              color: "white",
              fontWeight: "900",
            },
          ]}
        >
          {item.room.roomNumber}
        </Text>
      </Box>

      <Box style={[styles.body]}>
        <Box style={[styles.infoBox]}>
          <Text style={[styles.textColor]}>Status: {item.status}</Text>
          <Text style={[styles.textColor]}>{item.reference}</Text>
          <Text style={[styles.textColor]}>
            Check In: {parseIsoDate(item.checkInDate)?.monthName}{" "}
            {parseIsoDate(item.checkInDate)?.day}{" "}
            {parseIsoDate(item.checkInDate)?.dayName}
          </Text>
          <Text style={[styles.textColor]}>
            Check Out: {parseIsoDate(item.checkOutDate)?.monthName}{" "}
            {parseIsoDate(item.checkOutDate)?.day}{" "}
            {parseIsoDate(item.checkOutDate)?.dayName}
          </Text>
        </Box>
        <Box style={[styles.cta]}>
          <Button onPress={() => handleGotoBookingDetails(item.id)}>
            <Text style={[styles.textColor]}>View Details</Text>
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      // wrapInScrollView={false}
    >
      {boardingHouseData && (
        <Box>
          <Text
            style={{ fontSize: Fontsize.xl, color: "white", fontWeight: "900" }}
          >
            {boardingHouseData.name}
          </Text>
        </Box>
      )}
      {isBookingListLoading && <FullScreenLoaderAnimated />}
      <VStack style={{ flex: 1 }}>
        {bookingList && bookingList.length > 0 ? (
          <Lists
            list={bookingList}
            renderItem={renderBookingItem}
            refreshing={refreshing}
            onRefresh={handlePageRefresh}
            contentContainerStyle={{ gap: 10, padding: 10 }}
          />
        ) : (
          <Text style={[styles.textColor]}>Booking Empty</Text>
        )}
      </VStack>
    </StaticScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    borderRadius: 10,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  body: { borderWidth: 3, flexDirection: "row", borderColor: "red" },
  infoBox: {
    borderWidth: 3,
    flexDirection: "column",
    borderColor: "red",
    flex: 1,
  },
  textColor: {},
  item_header: { fontSize: Fontsize.h1 },
  center_item: { justifyContent: "center", alignContent: "center" },
  cta: { marginLeft: "auto" },
});
