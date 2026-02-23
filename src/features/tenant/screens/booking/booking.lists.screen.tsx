import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Button,
  useTheme,
  ActivityIndicator,
  Searchbar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import PropertyCard from "@/components/ui/BoardingHouseItems/PropertyCard";
import { Lists } from "@/components/layout/Lists/Lists";

import { Spacing, BorderRadius } from "@/constants";
import { useGetAllQuery as useGetAllBoardingHouses } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { QueryBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import {
  setQuery,
  setResults,
} from "@/infrastructure/redux-utils/genericSearchBar.slice";
import { RootState } from "@/application/store/stores";
import useDebounce from "@/infrastructure/utils/debounc.hook";

export default function BookingListsScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  // Redux search state
  const searchQuery = useSelector(
    (state: RootState) => state.genericSearch.query,
  );
  const searchResults = useSelector(
    (state: RootState) => state.genericSearch.results,
  );

  // Pagination & Data state
  const [page, setPage] = useState(1);
  const [allBoardingHouses, setAllBoardingHouses] = useState<
    QueryBoardingHouse[]
  >([]);
  const offset = 10;

  const {
    data: boardinghousesPage,
    isLoading,
    isFetching, // isFetching is true on every page change
    isError,
  } = useGetAllBoardingHouses({
    minPrice: 1500,
    page,
    offset,
  });

  // Handle data appending for pagination
  useEffect(() => {
    if (boardinghousesPage && boardinghousesPage.length > 0) {
      setAllBoardingHouses((prev) => {
        // Prevent duplicate IDs if the API or local state gets messy
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = boardinghousesPage.filter(
          (item) => !existingIds.has(item.id),
        );
        return [...prev, ...newItems];
      });
    }
  }, [boardinghousesPage]);

  // Debounced search logic
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const query = (debouncedQuery || "").toLowerCase();
    const filtered = allBoardingHouses.filter((bh) =>
      bh.name?.toLowerCase().includes(query),
    );
    dispatch(setResults(filtered));
  }, [debouncedQuery, allBoardingHouses, dispatch]);

  const handleGotoPress = (id: number) => {
    navigation.navigate("Booking", {
      screen: "BoardingHouseDetails",
      params: { id, fromMaps: true },
    });
  };

  const loadMore = () => {
    if (!isFetching && boardinghousesPage?.length === offset) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <StaticScreenWrapper
      variant="form" // Using form variant to avoid internal scroll conflicts
      loading={isLoading && page === 1}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={s.container}>
        {/* M3 Search Bar */}
        <Searchbar
          placeholder="Search boarding houses"
          value={searchQuery || ""}
          onChangeText={(val) => dispatch(setQuery(val))}
          style={s.searchBar}
          mode="bar"
        />

        <Lists
          list={searchResults}
          contentContainerStyle={s.listContent}
          onEndReached={loadMore} // Logic for infinite scroll
          renderItem={({ item }) => (
            <PropertyCard data={item}>
              <Button
                mode="contained-tonal"
                onPress={() => handleGotoPress(item.id ?? 0)}
                labelStyle={{ fontWeight: "bold" }}
              >
                View Details
              </Button>
            </PropertyCard>
          )}
          ListFooterComponent={
            isFetching ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : boardinghousesPage?.length === offset ? (
              <Button mode="text" onPress={loadMore} style={s.loadMoreBtn}>
                Load More
              </Button>
            ) : null
          }
        />
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  searchBar: {
    marginBottom: Spacing.md,
    elevation: 0,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: BorderRadius.lg,
  },
  listContent: {
    paddingBottom: 100,
    gap: Spacing.md,
  },
  loadMoreBtn: {
    marginVertical: Spacing.md,
  },
});
