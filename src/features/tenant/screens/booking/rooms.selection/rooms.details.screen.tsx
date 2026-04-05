import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { useGetOneQuery } from "@/infrastructure/room/rooms.redux.api";

import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { TenantBookingStackParamList } from "../navigation/booking.types";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import { useNavigation, useRoute } from "@react-navigation/native";
import RoomDetailsRender from "@/features/shared/rooms/RoomDetailsRender";
import { GlobalStyle } from "@/constants";

type RoomsDetailsScreenProps = NativeStackScreenProps<
  TenantBookingStackParamList,
  "RoomsDetailsScreen"
>;

export default function RoomsDetailsScreen({
  route,
  navigation,
}: RoomsDetailsScreenProps) {
  const navigate =
    useNavigation<NativeStackNavigationProp<TenantBookingStackParamList>>();

  const { boardingHouseId, roomId, ownerId } = route.params;

  if (!boardingHouseId || !roomId || !ownerId) {
    return <Text>Could not load Information!</Text>;
  }

  const [refreshing, setRefreshing] = React.useState(false);

  const {
    data: room,
    isLoading,
    isError,
    refetch,
  } = useGetOneQuery({ boardingHouseId, roomId });

  const gotoBooking = () => {
    navigate.navigate("RoomsCheckoutScreen", {
      roomId,
      ownerId,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  return (
    <StaticScreenWrapper
      variant="list"
      refreshing={refreshing}
      onRefresh={onRefresh}
      loading={isLoading}
      error={[isError ? "Failed to load room" : null]}
    >
      <RoomDetailsRender mode="view" data={room!} goToBook={gotoBooking} />
    </StaticScreenWrapper>
  );
}
