import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { FormControl, View, HStack } from "@gluestack-ui/themed";
import { Controller } from "react-hook-form";
import { Chip, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type BottomSheetTriggerFieldProps<T extends string = string> = {
  name: string;
  control: any;
  label?: string;
  options: SelectOption<T>[];
  isEditing: boolean;
  placeholder?: string;
  error?: string;
  onOpen: () => void;
};

export function BottomSheetTriggerField<T extends string>({
  name,
  control,
  label,
  options,
  isEditing,
  placeholder = "Select Option",
  error,
  onOpen,
}: BottomSheetTriggerFieldProps<T>) {
  const { colors } = useTheme();

  return (
    <FormControl isInvalid={!!error}>
      <Controller
        control={control}
        name={name}
        rules={{ required: `${label} is required` }}
        render={({ field: { value } }) => {
          const selected = options.find((o) => o.value === value);

          return (
            <View>
              {isEditing ? (
                <Pressable
                  onPress={onOpen}
                  style={({ pressed }) => [
                    s.triggerContainer,
                    {
                      borderColor: !!error
                        ? colors.error
                        : colors.outlineVariant,
                      backgroundColor: pressed
                        ? colors.surfaceVariant
                        : "#FFFFFF",
                    },
                  ]}
                >
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    w="$full"
                  >
                    <Text
                      style={[
                        s.triggerText,
                        { color: selected ? colors.onSurface : colors.outline },
                      ]}
                    >
                      {selected?.label ?? placeholder}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color={colors.outline}
                    />
                  </HStack>
                </Pressable>
              ) : (
                /* 2. OVERHAULED READ-ONLY STATE */
                <HStack alignItems="center" space="sm">
                  {label && <Text style={s.readOnlyLabel}>{label}:</Text>}
                  <Chip
                    textStyle={s.chipText}
                    style={[
                      s.chip,
                      { backgroundColor: colors.primaryContainer },
                    ]}
                  >
                    {selected?.label ?? "Not Set"}
                  </Chip>
                </HStack>
              )}

              {/* Error Message Support */}
              {error && (
                <Text style={[s.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}
            </View>
          );
        }}
      />
    </FormControl>
  );
}

const s = StyleSheet.create({
  triggerContainer: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  triggerText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  readOnlyLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#767474",
  },
  chip: {
    borderRadius: 6,
    height: 28,
  },
  chipText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    color: "#357FC1",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
});
