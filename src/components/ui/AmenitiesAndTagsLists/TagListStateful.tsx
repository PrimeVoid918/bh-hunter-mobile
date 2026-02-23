import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Chip, Text, useTheme } from "react-native-paper";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Spacing, BorderRadius } from "@/constants";

interface TagListDumbProps<T extends string> {
  items: readonly T[];
  selected: readonly T[];
  isEditing: boolean;
  onToggle: (value: T) => void;
}

// 1. Dumb Component (The UI)
const TagListDumb = <T extends string>({
  items,
  selected,
  isEditing,
  onToggle,
}: TagListDumbProps<T>) => {
  const theme = useTheme();

  return (
    <View style={s.container}>
      <View style={s.flexWrap}>
        {items.map((item) => {
          const isSelected = selected.includes(item);

          return (
            <Chip
              key={item}
              // M3 Logic: Show checkmark when selected
              selected={isSelected}
              showSelectedCheck={true}
              // If not editing, the chip is "read-only" (disabled)
              onPress={isEditing ? () => onToggle(item) : undefined}
              mode={isSelected ? "flat" : "outlined"}
              style={[
                s.chip,
                { borderRadius: BorderRadius.pill }, // M3 Chips are usually pill-shaped
                !isSelected && { borderColor: theme.colors.outlineVariant },
              ]}
              // M3 uses secondaryContainer for selected state by default in Paper
              selectedColor={theme.colors.onSecondaryContainer}
            >
              {item}
            </Chip>
          );
        })}
        {items.length === 0 && (
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            No items selected
          </Text>
        )}
      </View>
    </View>
  );
};

// 2. Stateful Component (The Logic)
export function TagListStateful<T extends string, TForm extends FieldValues>({
  name,
  items,
  isEditing,
  form,
}: {
  name: Path<TForm>;
  items: readonly T[];
  isEditing: boolean;
  form: Pick<UseFormReturn<TForm>, "watch" | "setValue" | "getValues">;
}) {
  const selected: T[] = (form.watch(name) ?? []) as T[];

  const toggle = (value: T) => {
    const current: T[] = (form.getValues(name) ?? []) as T[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    form.setValue(name, updated as any, { shouldDirty: true });
  };

  return (
    <TagListDumb
      items={isEditing ? items : selected} // Only show selected items when not editing
      selected={selected}
      isEditing={isEditing}
      onToggle={toggle}
    />
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  flexWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // M3 standard gap between chips
  },
  chip: {
    marginBottom: 4,
  },
});
