import { Text, StyleSheet } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Box, HStack } from "@gluestack-ui/themed";
import { BorderRadius, Colors, Fontsize } from "@/constants";

interface AmenitiesListProps {
  amenities: string[]; // Just the data to show
}

export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  // Handle empty state
  if (!amenities || amenities.length === 0) {
    return (
      <Text style={[s.amenityText, { marginTop: 12, opacity: 0.5 }]}>
        No amenities listed
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 12 }}
    >
      <HStack style={{ gap: 12, paddingRight: 20 }}>
        {amenities.map((item, index) => (
          <Box key={`${item}-${index}`} style={s.amenityChip}>
            <Text style={s.amenityText}>{item}</Text>
          </Box>
        ))}
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
