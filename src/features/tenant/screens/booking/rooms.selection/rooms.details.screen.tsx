import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { Box, Button, VStack } from "@gluestack-ui/themed";
import { useGetOneQuery } from "@/infrastructure/room/rooms.redux.api";
import ImageCarousel from "@/components/ui/ImageCarousel";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";

import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  RoomsBookingScreenRouteProp,
  TenantBookingStackParamList,
} from "../navigation/booking.types";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import { useNavigation, useRoute } from "@react-navigation/native";
import Container from "@/components/layout/Container/Container";

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

  //!
  const {
    data: roomData,
    isLoading: isRoomDataLoading,
    isError: isRoomDataError,
    error: roomDataError,
  } = useGetOneQuery({ boardingHouseId, roomId });

  if (isRoomDataError) {
    console.log("Room data error:", roomDataError);
  }

  const gotoBooking = (roomId: number) => {
    navigate.navigate("RoomsCheckoutScreen", {
      roomId: roomId,
      ownerId: ownerId,
    });
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.container]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
    >
      {isRoomDataLoading && <FullScreenLoaderAnimated />}
      {isRoomDataError && <FullScreenErrorModal />}
      <Container>
        {roomData && (
          <VStack>
            <Box>
              <Text style={[s.textColor, { fontSize: Fontsize.display1 }]}>
                {roomData.roomNumber}
              </Text>
            </Box>
            <Box>
              <Image
                source={
                  roomData?.thumbnail?.[0]?.url
                    ? { uri: roomData.thumbnail[0].url }
                    : require("@/assets/static/no-image.jpg")
                }
                style={{
                  margin: "auto",
                  width: "98%",
                  height: 200,
                  borderRadius: BorderRadius.md,
                }}
              />
            </Box>
            <ImageCarousel
              images={roomData.gallery ?? []}
              variant="secondary"
            ></ImageCarousel>
            <Box>
              <Box>
                <Text style={[s.textColor]}>{roomData.price}</Text>
              </Box>
              <Button onPress={() => gotoBooking(roomData.id)}>
                <Text style={[s.textColor]}>Book Now</Text>
              </Button>
            </Box>

            <Box>
              <ScrollView
                style={{ height: 150 }}
                contentContainerStyle={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                  justifyContent: "flex-start",
                  alignContent: "flex-start",
                }}
                nestedScrollEnabled={true} // important when inside another scrollable parent
                keyboardShouldPersistTaps="handled" // helps with form fields
              >
                {(roomData.tags ?? []).map((item, index) => (
                  <Box
                    key={index}
                    style={{
                      borderRadius: BorderRadius.md,
                      padding: 5,
                      // backgroundColor: Colors.
                    }}
                  >
                    <Text style={[s.generic_text, s.textColor]}>{item}</Text>
                  </Box>
                ))}
              </ScrollView>
            </Box>
          </VStack>
        )}
      </Container>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  generic_text: {},

  textColor: {
    color: Colors.TextInverse[2],
  },
});
