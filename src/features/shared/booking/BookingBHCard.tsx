import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { BorderRadius, Fontsize } from "@/constants";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";

export default function BookingBHCard({ data }: { data: GetBooking }) {
  const { boardingHouse } = data;
  const theme = useTheme();

  return (
    <Surface style={s.container} elevation={1}>
      <PressableImageFullscreen
        image={boardingHouse?.thumbnail?.[0] ?? null}
        containerStyle={s.image}
        imageStyleConfig={{ resizeMode: "cover" }}
      />
      <View style={s.overlay}>
        <Text variant="headlineSmall" style={s.name}>
          {boardingHouse?.name}
        </Text>
        <Text variant="bodyMedium" style={s.location}>
          {boardingHouse?.address || "Check address in details"}
        </Text>
      </View>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 24, // M3 Extra Large rounding
    overflow: "hidden",
    marginBottom: 12,
  },
  image: { width: "100%", aspectRatio: 16 / 9 },
  overlay: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.4)", // Glassmorphism feel
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  name: { color: "white", fontWeight: "900" },
  location: { color: "rgba(255,255,255,0.8)" },
});
