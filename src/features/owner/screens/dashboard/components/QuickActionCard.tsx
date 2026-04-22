import { View, StyleSheet } from "react-native";
import React from "react";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BorderRadius, Spacing } from "@/constants";

type QuickActionProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function QuickActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: QuickActionProps) {
  const { colors } = useTheme();

  return (
    <Surface
      elevation={0}
      style={[
        s.quickActionCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <TouchableRipple
        borderless={false}
        onPress={onPress}
        rippleColor="rgba(53,127,193,0.08)"
        style={s.quickActionRipple}
      >
        <HStack alignItems="center" justifyContent="space-between">
          <HStack alignItems="center" gap={Spacing.md} flex={1}>
            <Box
              style={[
                s.quickActionIconWrap,
                { backgroundColor: colors.primaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name={icon}
                size={20}
                color={colors.primary}
              />
            </Box>

            <VStack flex={1}>
              <Text
                variant="titleMedium"
                style={[s.quickActionTitle, { color: colors.onSurface }]}
              >
                {title}
              </Text>
              <Text
                variant="bodySmall"
                style={[s.quickActionSubtitle, { color: colors.outline }]}
              >
                {subtitle}
              </Text>
            </VStack>
          </HStack>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.outlineVariant}
          />
        </HStack>
      </TouchableRipple>
    </Surface>
  );
}

const s = StyleSheet.create({
  quickActionRipple: {
    padding: Spacing.base,
  },
  quickActionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  quickActionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionTitle: {
    fontFamily: "Poppins-SemiBold",
  },
  quickActionSubtitle: {
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
});
