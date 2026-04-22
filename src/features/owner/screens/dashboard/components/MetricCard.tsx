import { View, StyleSheet } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Surface, Text, useTheme } from "react-native-paper";
import { Box, VStack } from "@gluestack-ui/themed";
import { BorderRadius, Spacing } from "@/constants";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  bgColor: string;
  iconColor: string;
};

export default function MetricCard({
  label,
  value,
  icon,
  bgColor,
  iconColor,
}: MetricCardProps) {
  const { colors } = useTheme();

  return (
    <Surface
      elevation={0}
      style={[
        s.metricCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <VStack gap={Spacing.sm}>
        <Box style={[s.metricIconWrap, { backgroundColor: bgColor }]}>
          <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
        </Box>

        <VStack>
          <Text
            variant="headlineSmall"
            style={[s.metricValue, { color: colors.onSurface }]}
          >
            {value}
          </Text>
          <Text
            variant="bodySmall"
            style={[s.metricLabel, { color: colors.outline }]}
          >
            {label}
          </Text>
        </VStack>
      </VStack>
    </Surface>
  );
}

const s = StyleSheet.create({
  metricGrid: {
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  metricValue: {
    fontFamily: "Poppins-Bold",
    lineHeight: 28,
  },
  metricLabel: {
    fontFamily: "Poppins-Regular",
    marginTop: -2,
  },
});
