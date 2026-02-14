import { View, Text, Alert, StyleSheet, Pressable } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/application/store/stores";
import { useGetAllQuery } from "@/infrastructure/booking/booking.redux.api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TenantDashboardBookingStackParamList } from "./navigation/bookings.stack";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { VStack, Box, Button } from "@gluestack-ui/themed";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { Fontsize, GlobalStyle, Spacing } from "@/constants";
import { Lists } from "@/components/layout/Lists/Lists";
import RoomsItems from "@/components/ui/RoomsItems/RoomsItems";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import Container from "@/components/layout/Container/Container";
import BookingListItem from "./navigation/BookingListItem";

//For approved or ongoing stays

export default function DashboardBookingsScreen() {
  const navigate =
    useNavigation<
      NativeStackNavigationProp<TenantDashboardBookingStackParamList>
    >();
  const user = useSelector((state: RootState) => state.tenants.selectedUser);
  if (!user?.id) {
    return () => {
      navigate.goBack();
      Alert.alert("Something went wrong!");
    };
  }

  const onRefresh = () => {
    setRefreshing(true);
    refetch?.();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const [refreshing, setRefreshing] = React.useState(false);

  //! apply search in here
  const [search, setSearch] = React.useState<number | undefined>(undefined);

  const {
    data: bookingArrays,
    isLoading: isBookingArraysLoading,
    isError: isBookingArraysError,
    refetch,
  } = useGetAllQuery({ tenantId: user.id, page: 1, limit: 15});
  const books = React.useMemo(() => bookingArrays ?? [], [bookingArrays]);
  //! currently working for tenant side booking
  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
      //!if we want to use refresh control
      //! refreshControl={
      //!   <RefreshControl refreshing={isBookingArraysLoading} onRefresh={refetch} />
      //! }
    >
      <Container refreshing={refreshing} onRefresh={onRefresh}>
        {isBookingArraysLoading && <FullScreenLoaderAnimated />}
        {isBookingArraysError && <FullScreenErrorModal />}
        <VStack>
          <View
            style={{
              padding: 10,
            }}
          >
            <Lists
              list={books}
              renderItem={({ item }) => (
                <BookingListItem
                  data={item}
                  goToDetails={() =>
                    navigate.navigate("DashboardBookingStatusScreen", {
                      // bookId: book.id,
                      bookId: item.id,
                    })
                  }
                ></BookingListItem>
              )}
              contentContainerStyle={[{ gap: Spacing.base }]}
            />
          </View>
        </VStack>
      </Container>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  textColor: {
    color: "white",
  },
  item_cta_buttons: {
    fontSize: Fontsize.xl,
    fontWeight: "bold",
  },
});
