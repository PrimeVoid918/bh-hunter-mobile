import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { Searchbar, Text, useTheme } from "react-native-paper";
import { Lists } from "../Lists/Lists";
import { BorderRadius } from "@/constants";

interface PaginatedSearchListProps<T> {
  /**
   * RTK Query (or any data fetching hook) that returns an object containing:
   * - `data`: array of items of type T
   * - `isLoading`: boolean indicating initial load
   * - `isFetching`: boolean indicating ongoing fetch
   */
  useApi: (params: Record<string, any>) => {
    data?: T[];
    isLoading: boolean;
    isFetching: boolean;
  };

  /** Default API parameters (e.g., `{ minPrice: 1500 }`) */
  apiParams?: Record<string, any>;

  /**
   * Key used to delegate search to the API.
   * Example: 'name' → will send `{ name: searchValue }` to API.
   * If not provided, search falls back to client-side filtering (requires searchExtractor).
   */
  searchKey?: string;

  /** Function that renders each item in the list */
  renderItem: ({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) => React.ReactElement;

  /** Pull-to-refresh callback */
  onRefresh?: () => void;

  /** Whether the list is currently refreshing */
  refreshing?: boolean;

  /** Optional function that renders custom filter components */
  renderFilters?: () => React.ReactNode;

  /** Optional function that renders custom empty state */
  renderEmpty?: () => React.ReactNode;

  /** Styling for the content container of the list */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /** Styling for the outer wrapper */
  containerStyle?: StyleProp<ViewStyle>;

  /** Placeholder text for the search bar */
  searchPlaceholder?: string;

  /** Number of items to fetch per page */
  offset?: number;

  /**
   * Optional function to extract a string from each item for client-side filtering.
   * Required if searchKey is not provided and client-side search is desired.
   */
  searchExtractor?: (item: T) => string;

  ownerId?: number | undefined;
}

/**
 * `PaginatedSearchList` is a generic component that handles:
 * - Server-side fetching via a hook (`useApi`)
 * - Pagination and infinite scrolling
 * - Optional server-side or client-side search
 * - Optional filters and empty states
 *
 * It delegates most boilerplate logic (loading, pagination, search) internally.
 *
 * @template T Type of items in the list
 */
export default function PaginatedSearchList<T>({
  ownerId,
  useApi,
  apiParams = {},
  searchKey,
  renderItem,
  onRefresh,
  refreshing = false,
  renderFilters,
  renderEmpty,
  contentContainerStyle,
  containerStyle,
  searchPlaceholder = "Search...",
  offset = 10,
  searchExtractor,
}: PaginatedSearchListProps<T>) {
  const theme = useTheme();

  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [searchKeyTrigger, setSearchKeyTrigger] = useState(0);

  const { data, isLoading, isFetching } = useApi({
    ...apiParams,
    page,
    ownerId: ownerId ?? undefined,
    offset,
    ...(searchKey && searchValue.trim() ? { [searchKey]: searchValue } : {}),
    _trigger: searchKeyTrigger, // dummy param to force refetch
  });

  // Append new page results safely (dedupe by ID if possible)
  useEffect(() => {
    if (!data) return;

    setAllData((prev) => {
      if (page === 1) {
        // replace previous data on first page (reset)
        return data;
      }

      // append new items safely
      const existingIds = new Set((prev as any).map((item: any) => item.id));
      const newItems = (data as any).filter(
        (item: any) => !existingIds.has(item.id),
      );
      return [...prev, ...newItems];
    });
  }, [data, page]);

  // Reset pagination when search changes
  useEffect(() => {
    setPage(1);
    setAllData([]);
    setSearchKeyTrigger((prev) => prev + 1); // forces useApi to refetch
  }, [searchValue]);

  /**
   * Load more items when reaching the end of the list.
   * Will only increase page if there might be more items to fetch.
   */
  const loadMore = useCallback(() => {
    const hasNextPage = data?.length === offset;
    if (!isFetching && hasNextPage) setPage((prev) => prev + 1);
  }, [isFetching, data, offset]);

  // Client-side filtering (fallback if searchKey not provided)
  const filteredData = useMemo(() => {
    if (!searchExtractor || (searchKey && searchValue)) return allData;
    if (!searchValue.trim()) return allData;
    const lower = searchValue.toLowerCase();
    return allData.filter((item) =>
      searchExtractor(item)?.toLowerCase().includes(lower),
    );
  }, [allData, searchValue, searchExtractor, searchKey]);

  const isEmpty = filteredData.length === 0;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Search Bar */}
      <Searchbar
        placeholder={searchPlaceholder}
        value={searchValue}
        onChangeText={(text) => setSearchValue(text)}
        onIconPress={() => setSearchValue("")} // optional: clear on icon tap
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            borderRadius: BorderRadius.md,
          },
        ]}
        elevation={0}
      />

      {/* Filters Slot */}
      {renderFilters && <View style={styles.filters}>{renderFilters()}</View>}

      {/* List */}
      {isEmpty ? (
        renderEmpty ? (
          renderEmpty()
        ) : (
          <View style={styles.emptyState}>
            <Text>No results found.</Text>
          </View>
        )
      ) : (
        <Lists
          list={filteredData}
          renderItem={renderItem}
          onRefresh={onRefresh}
          refreshing={refreshing || isLoading}
          onEndReached={loadMore}
          ListFooterComponent={
            isFetching ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          contentContainerStyle={contentContainerStyle}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", gap: 12 },
  searchBar: { height: 52, borderWidth: 1, borderColor: "transparent" },
  filters: { width: "100%" },
  emptyState: { alignItems: "center", paddingVertical: 40, opacity: 0.6 },
  footerLoader: { paddingVertical: 16, alignItems: "center" },
});
