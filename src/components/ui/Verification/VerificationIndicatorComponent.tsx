import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { VStack } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import { BorderRadius, Colors, Spacing } from "@/constants";

interface VerificationIndicatorComponentProps {
  isVerified: boolean;
}

export default function VerificationIndicatorComponent({
  isVerified,
}: VerificationIndicatorComponentProps) {
  // const [isVerified, setIsVerified] = React.useState(false);

  const iconFontSize = 35;

  const colorConfig = {
    verifiedIcon: "#6a994e", // fallback to green
    unverifiedIcon: "#e5383b", // fallback to red
    bgVerified: "#386641", // fallback to green
    bgUnverified: "#841416", // fallback to red
  };

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: isVerified
            ? colorConfig.bgVerified
            : colorConfig.bgUnverified,
        },
      ]}
    >
      <Ionicons
        name={isVerified ? "checkmark-circle" : "close-circle"}
        size={iconFontSize}
        color={
          isVerified ? colorConfig.verifiedIcon : colorConfig.unverifiedIcon
        }
      />
      <VStack>
        <Text
          style={[
            s.text,
            { fontSize: iconFontSize * 0.6, color: colorConfig.text },
          ]}
        >
          {isVerified ? "Verified" : "Unverified"}
        </Text>
      </VStack>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    // borderWidth: 5,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  text: {
    color: Colors.TextInverse[2],
  },
});
