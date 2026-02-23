import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface, Avatar, useTheme } from "react-native-paper";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { BorderRadius, Spacing } from "@/constants";

export default function BookingRoomCard({ data }: { data: GetBooking }) {
  const theme = useTheme();
  const { room } = data;

  return (
    <Surface style={s.container} elevation={0}>
      <Avatar.Image
        size={60}
        source={{ uri: room?.thumbnail?.[0]?.uri }}
        style={s.avatar}
      />
      <View style={s.content}>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          Room Details
        </Text>
        <Text variant="titleLarge" style={s.roomNum}>
          Room {room?.roomNumber}
        </Text>
        <Text variant="bodyMedium">
          ₱{room?.price?.toLocaleString()} / month
        </Text>
      </View>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.05)", // Tonal background
    marginBottom: 16,
  },
  avatar: { backgroundColor: "#ccc" },
  content: { marginLeft: 16 },
  roomNum: { fontWeight: "bold" },
});
