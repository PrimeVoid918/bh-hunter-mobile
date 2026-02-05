import { View, Text, FlatList, ViewStyle, RefreshControl } from "react-native";
import React from "react";
import { StyleProp } from "react-native";

interface ListsProps<T> {
  /**
   * Array of items to render in the list
   */
  list: T[];

  /**
   * Function to render each item
   * @param item The item from the list
   * @param index The index of the item in the list
   * @returns React element representing the item
   */
  renderItem: ({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) => React.ReactElement;

  /**
   * Function called when pull-to-refresh is triggered
   */
  onRefresh?: () => void;

  /**
   * Boolean indicating whether the list is currently refreshing
   */
  refreshing?: boolean;

  /**
   * Function called when the list scroll reaches the end
   */
  onEndReached?: () => void;

  /**
   * Optional component rendered at the end of the list
   */
  ListFooterComponent?: React.ReactElement | null;

  /**
   * Style applied to the content container of the FlatList
   */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Style applied to each item container
   */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Generic reusable list component using FlatList
 * @template T The type of items in the list
 */
export function Lists<T>({
  list,
  renderItem,
  onRefresh,
  refreshing = false,
  onEndReached,
  ListFooterComponent = null,
  contentContainerStyle,
  containerStyle,
}: ListsProps<T>) {
  return (
    <FlatList
      data={list}
      renderItem={({ item, index }) => (
        <View style={[{ width: "100%" }, containerStyle]}>
          {renderItem({ item, index })}
        </View>
      )}
      keyExtractor={(item: any, index) =>
        item.id?.toString() ?? index.toString()
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      scrollEnabled={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent ?? undefined}
      contentContainerStyle={contentContainerStyle}
    />
  );
}
