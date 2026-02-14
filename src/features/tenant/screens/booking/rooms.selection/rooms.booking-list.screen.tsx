import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { Box, Button, Text, View, VStack } from "@gluestack-ui/themed";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { useGetOneQuery as useGetOneBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  RoomsBookingScreenRouteProp,
  TenantBookingStackParamList,
} from "../navigation/booking.types";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Lists } from "@/components/layout/Lists/Lists";
import RoomsItems from "@/components/ui/RoomsItems/RoomsItems";
import ScreenHeaderComponent from "@/components/layout/ScreenHeaderComponent";

export default function RoomsBookingListScreen() {
  const navigate =
    useNavigation<NativeStackNavigationProp<TenantBookingStackParamList>>();

  const route = useRoute<RoomsBookingScreenRouteProp>();
  const { paramsId } = route.params;

  const {
    data: boardingHouseData,
    isLoading: isBoardingHouseLoading,
    isError: isBoardingHouseError,
  } = useGetOneBoardingHouse(paramsId);
  const rooms = React.useMemo(
    () => boardingHouseData?.rooms ?? [],
    [boardingHouseData],
  ); // * to prevent creating a new empty array every render

  const gotoDetails = (roomId: number, bhId: number) => {
    navigate.navigate("RoomsDetailsScreen", {
      roomId: roomId,
      boardingHouseId: bhId,
      ownerId: boardingHouseData?.ownerId,
    });
  };

  const gotoBooking = (roomId: number) => {
    navigate.navigate("RoomsCheckoutScreen", {
      roomId: roomId,
      ownerId: boardingHouseData?.ownerId,
    });
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
    >
      {isBoardingHouseLoading && <FullScreenLoaderAnimated />}
      {isBoardingHouseError && <FullScreenErrorModal />}
      <VStack
        style={{
          padding: Spacing.md,
        }}
      >
        <ScreenHeaderComponent text={{ textValue: "Rooms" }} />
        <Lists
          list={rooms}
          renderItem={({ item }) => (
            <RoomsItems data={item} key={item.id.toString()}>
              <Pressable
                onPress={() => gotoDetails(item.id, item.boardingHouseId)}
              >
                <Text style={[s.textColor, s.item_cta_buttons]}>Details</Text>
              </Pressable>
              <Pressable onPress={() => gotoBooking(item.id)}>
                <Text style={[s.textColor, s.item_cta_buttons]}>Book Now</Text>
              </Pressable>
            </RoomsItems>
          )}
        />
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  item_cta_buttons: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.PrimaryLight[5],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.PrimaryLight[6],
  },

  textColor: {
    color: Colors.TextInverse[2],
  },
  textSm: { fontSize: Fontsize.xs },
  textBold: {
    fontWeight: "900",
  },
});
