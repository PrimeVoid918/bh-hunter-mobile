import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";
import { VStack, Box, HStack, Button } from "@gluestack-ui/themed";
import { Lists } from "@/components/layout/Lists/Lists";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "../navigation/dashboard.types";
import { useGetOneQuery as useGetOneBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import RoomsItems from "@/components/ui/RoomsItems/RoomsItems";
import ScreenHeaderComponent from "../../../../../components/layout/ScreenHeaderComponent";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import { useGetAllQuery as useGetAllRoomsQuery } from "@/infrastructure/room/rooms.redux.api";
import { Ionicons } from "@expo/vector-icons";

export default function RoomsListMainScreen({ route }) {
  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const paramsId = route.params.paramsId;
  console.log("paramsId: ", typeof paramsId);

  const {
    data: roomsData,
    isLoading: isRoomsLoading,
    isError: isRoomsError,
  } = useGetAllRoomsQuery(paramsId);
  const rooms = React.useMemo(() => roomsData ?? [], [roomsData]); // * to prevent creating a new empty array every render

  const gotoDetails = (roomId: number, bhId: number) => {
    navigate.navigate("RoomsDetailsScreen", {
      roomId: roomId,
      boardingHouseId: bhId,
    });
  };

  console.log("roomsData: ", roomsData);

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
    >
      {isRoomsLoading && <FullScreenLoaderAnimated />}
      {isRoomsError && <FullScreenErrorModal />}
      <VStack
        style={{
          padding: Spacing.md,
        }}
      >
        <HStack style={[{ padding: 10 }]}>
          <ScreenHeaderComponent text={{ textValue: "Rooms" }} />
          <Pressable
            onPress={() =>
              navigate.navigate("RoomsAddScreen", {
                bhId: paramsId,
              })
            }
            style={{
              marginLeft: "auto",
              backgroundColor: Colors.PrimaryLight[2],
              borderRadius: BorderRadius.md,
              width: "15%",
              height: 60, // need some height to center vertically
              justifyContent: "center", // vertical centering
              alignItems: "center", // horizontal centering
            }}
          >
            <Ionicons name="add-outline" color="black" size={30} />
          </Pressable>
        </HStack>
        <Lists
          list={rooms}
          contentContainerStyle={{ gap: Spacing.md }}
          renderItem={({ item }) => (
            <RoomsItems data={item} key={item.id.toString()}>
              <Pressable
                onPress={() => gotoDetails(item.id, item.boardingHouseId)}
              >
                <Text style={[s.textColor, s.item_cta_buttons]}>Details</Text>
              </Pressable>
            </RoomsItems>
          )}
        />
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  add_rooms_cta: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.PrimaryLight[1],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.PrimaryLight[6],
  },
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
