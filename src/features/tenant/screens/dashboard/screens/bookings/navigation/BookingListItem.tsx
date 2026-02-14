import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import {
  GetBooking,
  getBookingStatusDetails,
} from "@/infrastructure/booking/booking.schema";
import { Box, Button, HStack, VStack } from "@gluestack-ui/themed";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { Ionicons } from "@expo/vector-icons";

interface BookingListItemInterface {
  data: GetBooking;
  goToDetails: () => void;
}

export default function BookingListItem({
  data,
  goToDetails,
}: BookingListItemInterface) {
  const status = getBookingStatusDetails(data.status);
  const availabilityStatusText = data.room.availabilityStatus
    ? "Available"
    : "Not Available";
  const availabilityStatusColor = data.room.availabilityStatus
    ? "green"
    : "red";
  return (
    <Box style={[s.container]}>
      <PressableImageFullscreen
        image={data?.room?.thumbnail?.[0] ?? null}
        containerStyle={{ height: "100%", aspectRatio: 1 }}
        imageStyleConfig={{ resizeMode: "cover" }}
        removeFullScreenButton
      ></PressableImageFullscreen>
      <HStack style={[{ padding: Spacing.sm, flex: 1, height: "100%" }]}>
        <View style={[{ flex: 1, maxHeight: "100%" }]}>
          <Text
            style={[s.textColor, { fontSize: Fontsize.lg, fontWeight: "900" }]}
          >
            {data.room.roomNumber}
          </Text>

          <HStack>
            {" "}
            <Ionicons
              name="stop"
              color={availabilityStatusColor}
              size={Spacing.lg}
            />
            <Text style={[s.textColor]}>{availabilityStatusText}</Text>
          </HStack>

          <HStack style={[{ marginTop: "auto" }]}>
            <Ionicons
              name="caret-down-outline"
              color={status.color}
              size={Spacing.lg}
            />
            <Text style={[s.textColor]}>{status.label}</Text>
          </HStack>
        </View>

        <VStack style={[{ marginLeft: "auto" }]}>
          <Text style={[s.textColor]}>₱ {data.room.price}</Text>
          <Button onPress={goToDetails}>
            <Text style={[s.textColor]}>Details</Text>
          </Button>
        </VStack>
      </HStack>
    </Box>
  );
}

const s = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: Colors.PrimaryLight[7],
    borderRadius: BorderRadius.md,
    height: 100,
  },

  container_def: {
    flex: 1,
    padding: Spacing.sm,
    flexDirection: "column",
    alignContent: "flex-start",
  },

  item_header: {
    alignItems: "center",
  },

  item_desc: {},

  item_cta: {
    marginLeft: "auto",
    marginTop: "auto",
    padding: Spacing.xs,
    gap: Spacing.xs,
  },

  textColor: {
    color: Colors.TextInverse[2],
  },
  textSm: { fontSize: Fontsize.xs },
  textBold: {
    fontWeight: "900",
  },
});
