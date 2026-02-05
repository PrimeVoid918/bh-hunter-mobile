import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";
import React from "react";
import { Colors, Spacing, Fontsize, BorderRadius } from "@/constants";

interface FormStateActionsButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "outline";
  isLoading?: boolean;
  style?: ViewStyle; // Allows you to override layout from the parent
}

export default function FormStateActionsButton({
  label,
  onPress,
  variant = "primary",
  isLoading,
  style,
}: FormStateActionsButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      // This function style for 'style' is how you do hover/pressed effects in RN
      style={({ pressed }) => [
        s.container,
        s[variant], // Applies primary, danger, or outline styles
        pressed && s.pressed,
        isLoading && s.disabled,
        style,
      ]}
    >
      <Text
        style={[s.text, variant === "outline" ? s.textOutline : s.textWhite]}
      >
        {isLoading ? "Processing..." : label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  primary: {
    backgroundColor: Colors.PrimaryLight[3],
  },
  danger: {
    backgroundColor: "#ef4444", // standard red
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.PrimaryLight[1],
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }], // Slight "shrink" effect on press
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
    fontSize: Fontsize.md,
  },
  textWhite: {
    color: "#ffffff",
  },
  textOutline: {
    color: Colors.PrimaryLight[1],
  },
});
