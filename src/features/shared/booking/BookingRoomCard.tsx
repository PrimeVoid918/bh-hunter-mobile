import React from "react";
import { View, StyleSheet, Vibration } from "react-native";
import {
  Text,
  Surface,
  Avatar,
  useTheme,
  TouchableRipple,
  Icon,
} from "react-native-paper";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { Spacing } from "@/constants";

export default function BookingRoomCard({
  data,
  onPress,
}: {
  data: GetBooking;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const { room } = data;

  const handlePress = () => {
    Vibration.vibrate(10);
    onPress?.();
  };

  return (
    <Surface
      style={[
        s.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
      elevation={0}
    >
      <TouchableRipple
        onPress={handlePress}
        rippleColor="rgba(0, 0, 0, .1)"
        style={s.ripple}
      >
        <View style={s.innerContainer}>
          {/* Avatar with Status Overlay if needed */}
          <View>
            <Avatar.Image
              size={52}
              source={{ uri: room?.thumbnail?.[0]?.url }}
              style={{ backgroundColor: theme.colors.outlineVariant }}
            />
          </View>

          <View style={s.content}>
            <Text style={[s.label, { color: theme.colors.primary }]}>
              Booking Target
            </Text>
            <Text style={s.roomNum}>Room {room?.roomNumber}</Text>
            <Text style={[s.price, { color: theme.colors.onSurfaceVariant }]}>
              ₱{Number(room?.price).toLocaleString()}
              <Text style={s.perMonth}> / person</Text>
            </Text>
          </View>

          {/* Action Area: M3 Style "Go To" button */}
          <View
            style={[
              s.actionAnchor,
              { borderLeftColor: theme.colors.outlineVariant },
            ]}
          >
            <Icon
              source="chevron-right"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[s.viewLabel, { color: theme.colors.primary }]}>
              VIEW
            </Text>
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 12, // lg
    borderWidth: 1,
    overflow: "hidden", // Vital for TouchableRipple
    marginTop: -Spacing.sm,
    marginHorizontal: Spacing.sm,
  },
  ripple: {
    width: "100%",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  content: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  roomNum: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  price: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  perMonth: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    opacity: 0.7,
  },
  actionAnchor: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: Spacing.md,
    borderLeftWidth: 1,
    marginLeft: Spacing.sm,
  },
  viewLabel: {
    fontFamily: "Poppins-Bold",
    fontSize: 9,
    marginTop: -2,
  },
});
