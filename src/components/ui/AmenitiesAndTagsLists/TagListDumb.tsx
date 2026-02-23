import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip, Text, useTheme } from "react-native-paper";
import { BorderRadius, Spacing } from "@/constants";

interface TagListDumbProps<T extends string> {
  /** All possible items to display (available options) */
  items: readonly T[];
  /** Subset of items currently selected (the values to display) */
  selected: readonly T[];
  /** If false, only selected items are shown in a static wrapping list. */
  isEditing: boolean;
  /** Callback when a chip is pressed. Disabled if isEditing is false. */
  onToggle: (value: T) => void;
  /** Label shown when no items are selected in view mode. */
  emptyLabel?: string;
}

/**
 * A Material Design 3 Chip list that always wraps to the next line.
 * * - **Edit Mode**: Shows all items. Selected ones are highlighted with a checkmark.
 * - **View Mode**: Shows only selected items as static "badges".
 */
export default function TagListDumb<T extends string>({
  items,
  selected,
  isEditing,
  onToggle,
  emptyLabel = "No items listed",
}: TagListDumbProps<T>) {
  const theme = useTheme();

  // Show all items when editing to allow selection;
  // Show only selected items when viewing to act as a summary.
  const displayList = isEditing
    ? items
    : items.filter((i) => selected.includes(i));

  // Handle the empty state for View mode
  if (!isEditing && displayList.length === 0) {
    return (
      <Text variant="bodyMedium" style={s.emptyText}>
        {emptyLabel}
      </Text>
    );
  }

  return (
    <View style={s.flexWrap}>
      {displayList.map((item) => {
        const isSelected = selected.includes(item);

        return (
          <Chip
            key={item}
            selected={isSelected}
            // Logic: Only show the checkmark icon when the user is actively editing
            showSelectedCheck={isEditing}
            // Logic: Disable interaction if not in editing mode
            onPress={isEditing ? () => onToggle(item) : undefined}
            // M3 Style: 'flat' (filled) for selected, 'outlined' for available
            mode={isSelected ? "flat" : "outlined"}
            style={[
              s.chip,
              { borderRadius: BorderRadius.pill },
              !isSelected && { borderColor: theme.colors.outlineVariant },
              // View mode chips are slightly more compact
              !isEditing && { height: 32, justifyContent: "center" },
            ]}
            selectedColor={theme.colors.onSecondaryContainer}
            textStyle={s.chipText}
          >
            {item}
          </Chip>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  flexWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // Standard M3 spacing between chips
    paddingVertical: Spacing.xs,
  },
  chip: {
    marginVertical: 4, // Provides vertical breathing room when wrapped
  },
  chipText: {
    fontSize: 12,
  },
  emptyText: {
    marginTop: Spacing.xs,
    opacity: 0.6,
    fontStyle: "italic",
  },
});
