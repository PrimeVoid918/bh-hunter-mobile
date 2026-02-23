import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import {
  Surface,
  Text,
  IconButton,
  useTheme,
  Badge,
  Button,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { BorderRadius, Spacing } from "@/constants";
import {
  GetBooking,
  getBookingStatusDetails,
} from "@/infrastructure/booking/booking.schema";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";

interface BookingListItemInterface {
  data: GetBooking;
  goToDetails: () => void;
}

export default function BookingListItem({
  data,
  goToDetails,
}: BookingListItemInterface) {
  const theme = useTheme();

  // Status logic based on your schema utilities
  const status = getBookingStatusDetails(data.status);
  const isAvailable = data.room.availabilityStatus;

  return (
    <Surface
      elevation={0}
      style={[
        s.container,
        { backgroundColor: theme.colors.surfaceContainerLow },
      ]}
    >
      <Pressable onPress={goToDetails} style={s.pressable}>
        {/* 1. Left: Image Section */}
        <View style={s.imageWrapper}>
          <PressableImageFullscreen
            image={data?.room?.thumbnail?.[0] ?? null}
            containerStyle={s.image}
            imageStyleConfig={{ resizeMode: "cover" }}
            removeFullScreenButton
          />
          {/* Availability Dot */}
          <View
            style={[
              s.dot,
              { backgroundColor: isAvailable ? "#10b981" : "#ef4444" },
            ]}
          />
        </View>

        {/* 2. Middle: Info Section */}
        <View style={s.infoContent}>
          <View>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.primary, fontWeight: "bold" }}
            >
              {data.bookingType?.replace("_", " ")}
            </Text>
            <Text variant="titleMedium" style={s.roomNumber}>
              Room {data.room.roomNumber}
            </Text>
            <View style={s.row}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodySmall" style={s.dateText}>
                In: {new Date(data.checkInDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            style={[s.statusBadge, { backgroundColor: status.color + "20" }]}
          >
            <Text
              variant="labelSmall"
              style={{ color: status.color, fontWeight: "700" }}
            >
              {status.label.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* 3. Right: Price & Action Section */}
        <View style={s.actionArea}>
          <Text variant="titleMedium" style={s.price}>
            ₱{data.room.price.toLocaleString()}
          </Text>
          <IconButton
            icon="chevron-right"
            mode="contained-tonal"
            size={20}
            onPress={goToDetails}
          />
        </View>
      </Pressable>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    marginVertical: 6,
    marginHorizontal: 2,
    overflow: "hidden",
  },
  pressable: {
    flexDirection: "row",
    padding: Spacing.sm,
    alignItems: "center",
    height: 110,
  },
  imageWrapper: {
    position: "relative",
    height: "100%",
    aspectRatio: 1,
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: BorderRadius.md,
  },
  dot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  infoContent: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    justifyContent: "space-between",
    height: "100%",
  },
  roomNumber: {
    fontWeight: "900",
    marginTop: -2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    color: "rgba(0,0,0,0.6)",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    marginTop: 4,
  },
  actionArea: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
  },
  price: {
    fontWeight: "bold",
    color: "#1c1b1f",
  },
});
