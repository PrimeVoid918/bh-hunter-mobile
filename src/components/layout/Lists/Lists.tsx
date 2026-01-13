import { View, Text, FlatList, ViewStyle, RefreshControl } from "react-native";
import React from "react";
import { StyleProp } from "react-native";

interface ListsProps<T> {
  list: T[];
  renderItem: ({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) => React.ReactElement;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  ListFooterComponent?: React.ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

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
