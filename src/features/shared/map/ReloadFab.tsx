import { FAB, Portal, Provider } from "react-native-paper";
import React from "react";
import { BorderRadius, Colors, Spacing } from "@/constants";

export default function ReloadFAB({
  onPress,
  loading = false,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    // <Portal>
      <FAB
        icon={loading ? "refresh" : "refresh"}
        loading={loading}
        onPress={onPress}
        style={{
          position: "absolute",
          left: Spacing.base,
          bottom: "3%",
          borderRadius: BorderRadius.md,
          backgroundColor: Colors.whiteToBlack[6],
          zIndex: 20,
        }}
      />
    // </Portal>
  );
}
