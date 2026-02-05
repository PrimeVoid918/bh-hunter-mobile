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

  const {
    data: boardinghouse,
    isLoading: isBoardingHouseLoading,
    isError: isBoardingHouseError,
  } = useGetOneBoardingHouses(paramsId);

  // Optional logging
  useEffect(() => {
    if (boardinghouse) {
      console.log("Boarding house id:", paramsId);
      console.log("Boarding house details", boardinghouse);
    }
  }, [boardinghouse]);

  const handleGotoRoomLists = (bhNumber: number) => {
    if (!bhNumber) return "Invald Boarding House Number";
    navigateToDetails.navigate("RoomsBookingListsScreen", {
      paramsId: bhNumber,
    });
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
    >
      {isBoardingHouseLoading && <FullScreenLoaderAnimated />}
      {isBoardingHouseError && <FullScreenErrorModal />}
      <VStack style={[GlobalStyle.GlobalsContainer, s.main_container]}>
        <View style={[s.header]}>
          {boardinghouse && (
            <>
              <View>
                <PressableImageFullscreen
                  image={boardinghouse?.thumbnail?.[0]}
                  containerStyle={{ width: "100%", aspectRatio: 1 }}
                  imageStyleConfig={{
                    resizeMode: "cover",
                    containerStyle: {
                      margin: "auto",
                      borderRadius: BorderRadius.md,
                    },
                  }}
                />
              </View>
              <HStack>
                <Text style={[s.text_generic_small]}>* * * * *</Text>
                <Text style={[s.text_generic_small]}>( 4.0 )</Text>
              </HStack>
              <HStack
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <VStack style={{ width: "75%" }}>
                  <Text style={[s.text_title]}>{boardinghouse?.name}</Text>
                  <Text style={[s.text_address]}>{boardinghouse?.address}</Text>
                </VStack>
                <Button
                  containerStyle={{
                    marginTop: 10,
                    marginRight: 0,
                    padding: 10,
                  }}
                  onPressAction={() => handleGotoRoomLists(boardinghouse.id)}
                >
                  <Text>View Rooms</Text>
                </Button>
              </HStack>
            </>
          )}
        </View>
        <VStack style={[s.body]}>
          {boardinghouse && (
            <>
              <ImageCarousel
                variant="secondary"
                images={boardinghouse?.gallery ?? []}
              />
              <Text style={[s.text_description]}>
                {boardinghouse?.description}
              </Text>
              <VStack
                style={{
                  backgroundColor: Colors.PrimaryLight[7],
                  padding: 10,
                  borderRadius: BorderRadius.md,
                }}
              >
                <Text style={[s.text_generic_large]}>
                  Additional Information:
                </Text>
                <VStack>
                  <VStack
                    style={[
                      s.text_generic_medium,
                      {
                        gap: 5,
                        marginTop: 5,
                        flex: 1,
                      },
                    ]}
                  >
                    {boardinghouse?.amenities?.map((key, index) => (
                      <Text
                        key={index}
                        style={[
                          s.text_generic_medium,
                          {
                            backgroundColor: Colors.PrimaryLight[8],
                            padding: 5,
                            borderRadius: BorderRadius.md,
                          },
                        ]}
                      >
                        {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                      </Text>
                    ))}
                  </VStack>
                </VStack>
              </VStack>
            </>
          )}

          <ReviewSection boardingHouseId={boardinghouse?.id} />
        </VStack>
      </VStack>
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
  body: {
  },

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
