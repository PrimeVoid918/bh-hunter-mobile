import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import {
  Text,
  Surface,
  TouchableRipple,
  Icon,
  useTheme,
} from "react-native-paper";
import ReactNativeHapticFeedback from "react-native-haptic-feedback"; // Added
import { BorderRadius, Spacing, BorderWidth } from "@/constants";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";

interface Props {
  isVerified: boolean;
  onPress: () => void;
}

export default function VerificationIndicator({ isVerified, onPress }: Props) {
  const theme = useTheme();
  const { selectedUser } = useDynamicUserApi();
  if (!selectedUser) {
    return <Text>Loading user...</Text>;
  }
  const role = selectedUser.role;

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    onPress();
  };

  const config = isVerified
    ? {
        bg: theme.colors.primaryContainer,
        text: theme.colors.onPrimaryContainer,
        icon: "shield-check",
        label: `Verified ${role == "OWNER" ? "Tenant" : "Owner"}`,
        desc: "Identity confirmed",
      }
    : {
        bg: theme.colors.errorContainer,
        text: theme.colors.error,
        icon: "shield-alert-outline",
        label: "Unverified Account",
        desc: "Tap to verify identity",
      };

  return (
    <Surface
      elevation={isVerified ? 0 : 1}
      style={[
        s.surface,
        {
          backgroundColor: config.bg,
          borderRadius: BorderRadius.md,
          borderWidth: isVerified ? 0 : BorderWidth.xs,
          borderColor: theme.colors.error,
        },
      ]}
    >
      <TouchableRipple
        onPress={handlePress}
        style={s.ripple}
        rippleColor="rgba(0,0,0,0.08)"
        borderless={true}
      >
        <View style={s.content}>
          <Icon source={config.icon} size={28} color={config.text} />

          <View style={s.textContainer}>
            <Text
              variant="labelLarge"
              style={[s.title, { color: config.text }]}
            >
              {config.label}
            </Text>
            <Text
              variant="bodySmall"
              style={[s.subtitle, { color: config.text }]}
            >
              {config.desc}
            </Text>
          </View>

          <Icon source="chevron-right" size={20} color={config.text} />
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const s = StyleSheet.create({
  surface: {
    marginVertical: Spacing.sm,
    overflow: "hidden",
  },
  ripple: {
    padding: Spacing.base,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: "Poppins-Medium",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    opacity: 0.8,
  },
});
