import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";
import { Box, Image, VStack } from "@gluestack-ui/themed";
import { useGetAllQuery as useGetAllBoardingHouses } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import {
  // GetBoardingHouse,
  QueryBoardingHouse,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import { ScrollView } from "react-native-gesture-handler";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { TenantTabsParamList } from "../../navigation/tenant.tabs.types";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { useDispatch, useSelector } from "react-redux";
import genericSearchBarSlice, {
  setQuery,
  setResults,
} from "../../../../infrastructure/redux-utils/genericSearchBar.slice";
import { RootState } from "@/application/store/stores";
import useDebounce from "@/infrastructure/utils/debounc.hook";
import ComponentLoaderAnimated from "@/components/ui/ComponentLoaderAnimated";
import PropertyCard from "@/components/ui/BoardingHouseItems/PropertyCard";
import { Lists } from "@/components/layout/Lists/Lists";

export default function BookingListsScreen() {
  const navigation =
    useNavigation<BottomTabNavigationProp<TenantTabsParamList>>();

  const dispatch = useDispatch();
  const searchQuery = useSelector(
    (state: RootState) => state.genericSearch.query,
  );
  const searchResults = useSelector(
    (state: RootState) => state.genericSearch.results,
  );

  const [filters, setFilters] = useState<QueryBoardingHouse>({
    minPrice: 1500,
  });
  const [page, setPage] = useState(1); // current page
  const [allBoardingHouses, setAllBoardingHouses] = useState<
    QueryBoardingHouse[]
  >([]);
  const offset = 10; // items per page

  const {
    data: boardinghousesPage,
    isLoading: isBoardingHousesLoading,
    isError: isBoardingHousesError,
  } = useGetAllBoardingHouses({
    ...filters,
    page,
    offset,
  });

  useEffect(() => {
    if (!boardinghousesPage) return;
    setAllBoardingHouses((prev) => [...prev, ...boardinghousesPage]);
  }, [boardinghousesPage]);

  const debouncedQuery = useDebounce(searchQuery, 150);

  useEffect(() => {
    const query = (debouncedQuery || "").toLowerCase();

    const filtered = allBoardingHouses.filter((bh) =>
      bh.name?.toLowerCase().includes(query),
    );

    dispatch(setResults(filtered));
  }, [debouncedQuery, allBoardingHouses, dispatch]);

  const handleGotoPress = (id: number) => {
    // console.log("handleGotoPress", id);
    navigation.navigate("Booking", {
      screen: "BoardingHouseDetails",
      params: { id: id, fromMaps: true },
    });
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
    >
      {isBoardingHousesError && <FullScreenErrorModal />}
      <VStack style={[styles.container]}>
        <HeaderSearch
          placeholder="Search boarding houses"
          value={searchQuery}
          setValue={(val) => {
            dispatch(setQuery(val));
          }}
          containerStyle={{
            // backgroundColor: Colors.
            borderRadius: 10,
            paddingLeft: 5,
            paddingRight: 5,

            zIndex: 10,
          }}
        />
        {isBoardingHousesLoading && <ComponentLoaderAnimated />}
        <Lists
          list={searchResults.map((item) => item)}
          contentContainerStyle={[styles.list_container]}
          renderItem={({ item }) => (
            <PropertyCard data={item}>
              <Pressable
                onPress={() => handleGotoPress(item.id ?? 0)}
                style={{
                  padding: Spacing.sm,
                  borderWidth: 2,
                  // borderColor: Colors.
                  borderRadius: BorderRadius.lg,
                  // backgroundColor: Colors.
                }}
              >
                <Text style={{ color: "white" }}>Details</Text>
              </Pressable>
            </PropertyCard>
          )}
          ListFooterComponent={
            boardinghousesPage?.length &&
            boardinghousesPage.length >= offset ? (
              <Pressable
                onPress={() => setPage((prev) => prev + 1)}
                style={{
                  padding: 12,
                  // backgroundColor: Colors.
                  borderRadius: BorderRadius.md,
                  alignItems: "center",
                  marginVertical: 10,
                }}
              >
                <Text
                  style={{ color: Colors.TextInverse[2], fontWeight: "bold" }}
                >
                  Show More
                </Text>
              </Pressable>
            ) : null
          }
        />
      </VStack>
    </StaticScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  list_container: {
    gap: Spacing.md,
  },

  generic_text: {
    color: Colors.TextInverse[2],
  },
  Item_Label: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.xl,
    marginBottom: 6,
    flexWrap: "wrap",
    // flexShrink: 1,
  },
  Item_SubLabel: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.lg,
    marginBottom: 6,
  },
  Item_Normal: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.md,
  },
  Item_Input_Placeholder: {
    color: Colors.TextInverse[2],
    fontSize: Fontsize.md,
  },
});
