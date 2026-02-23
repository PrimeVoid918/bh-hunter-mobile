import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface, Text, useTheme, Avatar, Divider } from "react-native-paper";
import { GetBooking } from "@/infrastructure/booking/booking.schema";

interface BookingInfoBarInterface {
  data: GetBooking;
}

export default function BookingInfoBar({ data }: BookingInfoBarInterface) {
  const theme = useTheme();

  const checkInDate = new Date(data.checkInDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Surface elevation={1} style={s.container}>
      {/* Top Row: Icon and Reference */}
      <View style={s.row}>
        <View style={s.headerLeft}>
          <Avatar.Icon
            size={40}
            icon="bookmark-outline"
            style={{ backgroundColor: theme.colors.primaryContainer }}
            color={theme.colors.onPrimaryContainer}
          />
          <View style={s.textGap}>
            <Text variant="labelMedium" style={{ color: theme.colors.outline }}>
              Reference
            </Text>
            <Text variant="titleMedium" style={s.bold}>
              {data.reference}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <Surface
          elevation={0}
          style={[s.badge, { backgroundColor: theme.colors.secondary }]}
        >
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSecondary, fontWeight: "700" }}
          >
            {data.status.replace("_", " ")}
          </Text>
        </Surface>
      </View>

      <Divider style={s.divider} />

      {/* Bottom Row: Date and Room info */}
      <View style={s.detailsRow}>
        <View style={s.detailItem}>
          <Avatar.Icon
            size={24}
            icon="calendar-range"
            style={s.transparent}
            color={theme.colors.primary}
          />
          <Text variant="bodySmall" style={s.detailText}>
            {checkInDate}
          </Text>
        </View>

        {data.room?.roomNumber && (
          <View style={s.detailItem}>
            <Avatar.Icon
              size={24}
              icon="door-open"
              style={s.transparent}
              color={theme.colors.primary}
            />
            <Text variant="bodySmall" style={s.detailText}>
              Room {data.room.roomNumber}
            </Text>
          </View>
        )}
      </View>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textGap: {
    gap: -2,
  },
  bold: {
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 12,
    opacity: 0.5,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    opacity: 0.8,
  },
  transparent: {
    backgroundColor: "transparent",
  },
});
