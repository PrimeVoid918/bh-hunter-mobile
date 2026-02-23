import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Icon, Surface, useTheme } from "react-native-paper";
import { BorderRadius } from "../../../constants/themes/border";

interface DashboardStateCardInterface {
  label: any;
  value: any;
  icon: any;
  bgColor: any;
  textColor: any;
}

export default function DashboardStateCard({
  bgColor,
  icon,
  label,
  textColor,
  value,
}: DashboardStateCardInterface) {
  const theme = useTheme();
  return (
    <Surface
      style={[
        s.statCard,
        {
          backgroundColor: bgColor,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
      elevation={0}
    >
      <Icon source={icon} size={24} color={textColor} />
      <Text
        variant="headlineMedium"
        style={{ color: textColor, fontWeight: "900", marginTop: 4 }}
      >
        {value}
      </Text>
      <Text variant="labelSmall" style={{ color: textColor, opacity: 0.8 }}>
        {label}
      </Text>
    </Surface>
  );
}

const s = StyleSheet.create({
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: BorderRadius.md, // M3 Large rounding
    alignItems: "flex-start",
    borderWidth: 1,
  },
});
