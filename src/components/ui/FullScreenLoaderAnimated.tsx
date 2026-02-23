import React from "react";
import { StyleSheet, View, ColorValue } from "react-native";
import { Portal, ActivityIndicator } from "react-native-paper";

interface FullScreenLoaderProps {
  visible?: boolean;
  spinnerColor?: ColorValue;
}

export default function FullScreenLoaderAnimated({
  visible = true,
  spinnerColor = "white",
}: FullScreenLoaderProps) {
  if (!visible) return null;

  return (
    <Portal>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={spinnerColor} />
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // fills the entire screen
    backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // ensure on top
  },
});
