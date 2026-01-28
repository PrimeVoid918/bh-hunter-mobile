import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { Box, HStack } from "@gluestack-ui/themed";
import { BorderRadius, Colors, Fontsize } from "@/constants";
import { PatchBoardingHouseInput } from "../../../infrastructure/boarding-houses/boarding-house.schema";
import {
  AMENITIES,
  Amenity,
} from "@/infrastructure/boarding-houses/boarding-house.constants";
import { UseFormReturn } from "react-hook-form";

interface amenitiesListInterface {
  globalIsEditing: boolean;
  formDataOps: Pick<
    UseFormReturn<PatchBoardingHouseInput>,
    "watch" | "setValue" | "getValues"
  >;
}

export default function AmenitiesList({
  globalIsEditing,
  formDataOps,
}: amenitiesListInterface) {
  const { getValues, setValue, watch } = formDataOps;
  const selectedAmenities = watch("amenities") ?? [];

  // Determine which list to render: Everything (Edit Mode) or only Selected (View Mode)
  const displayList = globalIsEditing
    ? AMENITIES
    : AMENITIES.filter((amenity) => selectedAmenities.includes(amenity));

  // If not editing and nothing is selected, you might want to show a "No amenities" message
  if (!globalIsEditing && displayList.length === 0) {
    return (
      <Text style={[s.amenityText, { marginTop: 12, opacity: 0.5 }]}>
        No amenities listed
      </Text>
    );
  }

  const toggleAmenity = (amenity: Amenity) => {
    const current = getValues("amenities") ?? [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];

    setValue("amenities", updated, { shouldDirty: true });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 12 }}
    >
      <HStack style={{ gap: 12, paddingRight: 20 }}>
        {displayList.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity);

          // LOGIC: Only apply "Selected" styles if we are in Editing Mode
          const shouldShowActiveStyle = globalIsEditing && isSelected;

          const ChipContent = (
            <Box
              style={[
                s.amenityChip,
                shouldShowActiveStyle && s.amenityChipSelected, // Green only if editing
              ]}
            >
              <Text
                style={
                  shouldShowActiveStyle ? s.amenityTextSelected : s.amenityText
                }
              >
                {amenity}
              </Text>
            </Box>
          );

          return globalIsEditing ? (
            <Pressable key={amenity} onPress={() => toggleAmenity(amenity)}>
              {ChipContent}
            </Pressable>
          ) : (
            <View key={amenity}>{ChipContent}</View>
          );
        })}
      </HStack>
    </ScrollView>
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
