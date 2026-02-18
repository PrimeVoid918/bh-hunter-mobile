import { Text, StyleSheet } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Box, HStack, Pressable, View } from "@gluestack-ui/themed";
import { BorderRadius, Colors, Fontsize } from "@/constants";

interface TagListDumbInterface<T extends string> {
  items: readonly T[];
  selected: readonly T[];
  isEditing: boolean;
  onToggle: (value: T) => void;
  emptyLabel?: string;
}

export default function TagListDumb<T extends string>({
  items,
  selected,
  isEditing,
  onToggle,
  emptyLabel = "No items listed",
}: TagListDumbInterface<T>) {
  const displayList = isEditing
    ? items
    : items.filter((i) => selected.includes(i));

  if (!isEditing && displayList.length === 0) {
    return (
      <Text style={[s.amenityText, { marginTop: 12, opacity: 0.5 }]}>
        {emptyLabel}
      </Text>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <HStack style={{ gap: 12, paddingRight: 20 }}>
        {displayList.map((item) => {
          const active = isEditing && selected.includes(item);

          const Chip = (
            <Box style={[s.amenityChip, active && s.amenityChipSelected]}>
              <Text style={active ? s.amenityTextSelected : s.amenityText}>
                {item}
              </Text>
            </Box>
          );

          return isEditing ? (
            <Pressable key={item} onPress={() => onToggle(item)}>
              {Chip}
            </Pressable>
          ) : (
            <View key={item}>{Chip}</View>
          );
        })}
      </HStack>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  amenitiesContainer: {
    padding: 16,
    borderRadius: BorderRadius.md,
  },
  amenityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  amenityChipSelected: {
    backgroundColor: "#10b981",
  },
  amenityText: {
    fontSize: Fontsize.sm,
  },
  amenityTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  amenityDisplay: {
    padding: 10,
    borderRadius: BorderRadius.md,
    fontSize: Fontsize.md,
  },
});
