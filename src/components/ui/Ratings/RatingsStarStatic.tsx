import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Colors, Spacing } from "@/constants";
import { HStack } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";

export default function RatingsStarStatic() {
  return (
    <HStack style={{}}>
      <HStack
        style={[
          {
            gap: Spacing.xs,
          },
        ]}
      >
        <Ionicons name="star" size={20} color="gold" />
        <Ionicons name="star" size={20} color="gold" />
        <Ionicons name="star" size={20} color="gold" />
        <Ionicons name="star" size={20} color="gold" />
        <Ionicons name="star-half" size={20} color="gold" />
        <Text style={[s.text_color]}>(4.0)</Text>
      </HStack>
    </HStack>
  );
}

const s = StyleSheet.create({
  text_color: {
    color: Colors.TextInverse[1],
  },
});
