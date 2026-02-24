import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import {
  Colors,
  Spacing,
  GlobalStyle,
  Fontsize,
  BorderRadius,
} from "@/constants";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useNavigationState } from "@react-navigation/native";

// ui components
import ImageCarousel from "@/components/ui/ImageCarousel";
import Button from "@/components/ui/Button";

// laytou
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// redux
import { Box, HStack, VStack } from "@gluestack-ui/themed";

import { useGetOneQuery as useGetOneBoardingHouses } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { TenantBookingStackParamList } from "../navigation/booking.types";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import ReviewSection from "../../../../../components/ui/Reviews/ReviewSection";
import Container from "@/components/layout/Container/Container";
import BoardingHouseDetailsRender from "@/features/shared/boarding-house/BoardingHouseDetailsRender";

// type Props = NativeStackScreenProps<TenantTabsParamList, "Booking">;
type RouteProps = RouteProp<
  TenantBookingStackParamList,
  "BoardingHouseDetails"
>;

export default function BoardingHouseDetailsScreen() {
  const navigateToDetails =
    useNavigation<NativeStackNavigationProp<TenantBookingStackParamList>>();
  const route = useRoute<RouteProps>();
  const { id: paramsId, fromMaps } = route.params;

  const [refreshing, setRefreshing] = useState(false);

  const {
    data: boardinghouse,
    isLoading: isBoardingHouseLoading,
    isError: isBoardingHouseError,
    refetch,
  } = useGetOneBoardingHouses(paramsId);

  const onRefresh = () => {
    setRefreshing(true);
    refetch?.();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Optional logging
  useEffect(() => {
    if (boardinghouse) {
      console.log("Boarding house id:", paramsId);
      console.log("Boarding house details", boardinghouse);
    }
  }, [boardinghouse]);

  const goToRooms = () => {
    if (!boardinghouse) return "Invald Boarding House Number";
    navigateToDetails.navigate("RoomsBookingListsScreen", {
      paramsId: boardinghouse.id,
    });
  };

  return (
    <StaticScreenWrapper
      variant="list"
      contentContainerStyle={GlobalStyle.GlobalsContentContainer}
      refreshing={refreshing}
      onRefresh={onRefresh}
      loading={isBoardingHouseLoading}
      error={[isBoardingHouseError ? "" : null]}
    >
      <BoardingHouseDetailsRender
        mode="view"
        data={boardinghouse!}
        onViewRooms={goToRooms}
      />

      <ReviewSection boardingHouseId={boardinghouse?.id} />
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  main_container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    minHeight: 250,
    width: "100%",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    zIndex: 5,
    marginBottom: 10,
    gap: 10,
  },
  body: {},

  text_title: {
    color: Colors.TextInverse[1],
    fontSize: Fontsize.xxl,
    fontWeight: 900,
  },
  text_description: {
    fontSize: Fontsize.lg,
    padding: 5,
    color: Colors.TextInverse[2],
  },
  text_ameneties: {
    borderColor: "green",
    borderWidth: 3,
    flexDirection: "column",
  },
  text_ameneties_items: {
    fontSize: Fontsize.lg,
    padding: 5,
    color: Colors.TextInverse[2],
  },
  text_address: {
    fontSize: Fontsize.sm,
    paddingTop: 5,
    color: Colors.TextInverse[2],
  },
  text_price: {
    borderColor: "cyan",
    borderWidth: 3,
  },
  text_properties: {
    borderColor: "magenta",
    borderWidth: 3,
  },
  text_generic_small: {
    fontSize: Fontsize.sm,
    padding: 0,
    color: Colors.TextInverse[1],
  },
  text_generic_medium: {
    fontSize: Fontsize.md,
    padding: 0,
    color: Colors.TextInverse[1],
  },
  text_generic_large: {
    fontSize: Fontsize.lg,
    padding: 0,
    color: Colors.TextInverse[1],
  },
});
