import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { Box, HStack } from "@gluestack-ui/themed";
import { BorderRadius, Colors, Fontsize } from "@/constants";
import TagListDumb from "./TagListDumb";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface TagListInterface<T extends string> {
  items: readonly T[];
  selected: readonly T[];
  isEditing: boolean;
  onToggle: (value: T) => void;
  emptyLabel?: string;
}

interface TagListStatefulProps<T extends string, TForm extends FieldValues> {
  name: Path<TForm>;
  items: readonly T[];
  isEditing: boolean;
  form: Pick<UseFormReturn<TForm>, "watch" | "setValue" | "getValues">;
}

export function TagListStateful<T extends string, TForm extends FieldValues>({
  name,
  items,
  isEditing,
  form,
}: TagListStatefulProps<T, TForm>) {
  // Type selected as T[]
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
      items={items}
      selected={selected}
      isEditing={isEditing}
      onToggle={toggle}
    />
  );
}

const s = StyleSheet.create({
  amenitiesContainer: {
    backgroundColor: Colors.PrimaryLight[7],
    padding: 16,
    borderRadius: BorderRadius.md,
  },
  amenityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.PrimaryLight[6],
    borderRadius: BorderRadius.md,
  },
  amenityChipSelected: {
    backgroundColor: "#10b981",
  },
  amenityText: {
    color: Colors.TextInverse[1],
    fontSize: Fontsize.sm,
  },
  amenityTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  amenityDisplay: {
    backgroundColor: Colors.PrimaryLight[8],
    padding: 10,
    borderRadius: BorderRadius.md,
    fontSize: Fontsize.md,
    color: Colors.TextInverse[1],
  },
});
