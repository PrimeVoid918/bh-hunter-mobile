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
import { VStack, Box } from "@gluestack-ui/themed";
import { Lists } from "@/components/layout/Lists/Lists";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "../navigation/dashboard.types";
import { useGetOneQuery as useGetOneBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import RoomsItems from "@/components/ui/RoomsItems/RoomsItems";
import ScreenHeaderComponent from "../../../../../components/layout/ScreenHeaderComponent";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";

export default function RoomsListMainScreen({ route }) {
  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const paramsId = route.params.paramsId;
  console.log("paramsId: ", paramsId);

  const {
    data: boardingHouseData,
    isLoading: isBoardingHouseLoading,
    isError: isBoardingHouseError,
  } = useGetOneBoardingHouse(paramsId);
  const rooms = React.useMemo(
    () => boardingHouseData?.rooms ?? [],
    [boardingHouseData]
  ); // * to prevent creating a new empty array every render

  const gotoDetails = (roomId: number, bhId: number) => {
    navigate.navigate("RoomsDetailsScreen", {
      roomId: roomId,
      boardingHouseId: bhId,
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
