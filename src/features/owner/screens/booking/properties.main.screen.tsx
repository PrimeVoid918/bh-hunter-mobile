import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";
import { Box, Button, Image, Spinner, VStack } from "@gluestack-ui/themed";
import { useGetAllQuery as useGetAllBoardingHouses } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import {
  GetBoardingHouse,
  QueryBoardingHouse,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import { ScrollView } from "react-native-gesture-handler";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { OwnerTabsParamList } from "../../navigation/owner.tabs.type";
import { BoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import { useSelector } from "react-redux";
import { RootState } from "@/application/store/stores";
import ScreenHeaderComponent from "@/components/layout/ScreenHeaderComponent";
import { Lists } from "@/components/layout/Lists/Lists";
import BoardingHouseBookingItem from "@/components/ui/Bookings/BoardingHouseBookingItem";
import Container from "@/components/layout/Container/Container";

export default function PropertiesMainScreen() {
  const ownerId = useSelector(
    (state: RootState) => state.owners.selectedUser?.id,
  );
  const navigation =
    useNavigation<BottomTabNavigationProp<OwnerTabsParamList>>();

  const [refreshing, setRefreshing] = React.useState(false);

  const [filters, setFilters] = useState<QueryBoardingHouse>({
    minPrice: 1500,
    offset: 50,
    ownerId: ownerId,
  });

  const {
    data: boardinghouses,
    isLoading: isBoardingHousesLoading,
    isError: isBoardingHousesError,
    refetch,
  } = useGetAllBoardingHouses(filters);

  const handlePageRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };
  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, styles.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
    >
      <Container>
        {isBoardingHousesLoading && <FullScreenLoaderAnimated />}
        {isBoardingHousesError && <FullScreenErrorModal />}
        <ScreenHeaderComponent text={{ textValue: "Bookings" }} />
        {boardinghouses && (
          <Lists
            list={boardinghouses}
            renderItem={({ item, index }) => (
              <BoardingHouseBookingItem
                data={item}
                goToDetails={() => {
                  // console.log("handleGotoPress", item.id);
                  navigation.navigate("Booking", {
                    screen: "PropertiesBookingListsScreen",
                    params: { bhId: item.id },
                    // params: { bhId: id, fromMaps: true },
                  });
                }}
              >
                <Button>
                  <Text>Show Bookings</Text>
                </Button>
              </BoardingHouseBookingItem>
            )}
            contentContainerStyle={{
              gap: Spacing.base,
            }}
          ></Lists>
        )}
      </Container>
    </StaticScreenWrapper>
  );
}

const styles = StyleSheet.create({
  GlobalsContainer: {
    padding: Spacing.md,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent dark background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // ensure it's above everything
  },
  generic_text: {
    color: Colors.TextInverse[2],
  },
  Item_Label: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.md,
    marginBottom: 6,
    flexWrap: "wrap",
    // flexShrink: 1,
  },
  Item_SubLabel: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.md,
    marginBottom: 6,
  },
  Item_Normal: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.sm,
  },
  Item_Input_Placeholder: {
    color: Colors.TextInverse[2],
    fontSize: Fontsize.sm,
  },
});
