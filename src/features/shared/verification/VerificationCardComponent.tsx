import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "@gluestack-ui/themed";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BorderRadius, Spacing, Colors } from "@/constants";
import { VerificationStatus } from "@/infrastructure/valid-docs/verification-document/verification-document.schema";

export interface VerificationCardComponentInterface {
  title: string;
  status: VerificationStatus;
  onPress: () => void;
}

const statusStyles: Record<
  VerificationStatus,
  {
    bg: string;
    icon: string;
    iconName: string;
    label: string;
  }
> = {
  APPROVED: {
    bg: "#1B5E20",
    icon: "#34A853",
    iconName: "checkmark-circle",
    label: "Approved",
  },
  PENDING: {
    bg: "#0D47A1",
    icon: "#4285F4",
    iconName: "time",
    label: "Under Review",
  },
  REJECTED: {
    bg: "#7F1D1D",
    icon: "#EA4335",
    iconName: "close-circle",
    label: "Rejected",
  },
  MISSING: {
    bg: "#3E2723",
    icon: "#FB8C00",
    iconName: "alert-circle",
    label: "Not Submitted",
  },
};

export default function VerificationCardComponent({
  title,
  status,
  onPress,
}: VerificationCardComponentInterface) {
  const config = statusStyles[status];

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Ionicons name={config.iconName} size={40} color={config.icon} />

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{config.label}</Text>
      </View>

      <Button style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>
          {status === "MISSING" || status === "REJECTED" ? "Submit" : "View"}
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.TextInverse[1],
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: Colors.TextInverse[1],
    fontSize: 12,
    opacity: 0.8,
  },
  button: {
    marginLeft: "auto",
  },
  buttonText: {
    color: "white",
  },
});
