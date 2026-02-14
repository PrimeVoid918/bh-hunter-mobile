import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { BorderRadius, Colors, Fontsize } from "@/constants";
import ImageFullScreenModal from "@/components/ui/ImageComponentUtilities/ImageFullScreenModal";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { Ionicons } from "@expo/vector-icons";
import { HStack } from "@gluestack-ui/themed";

interface BookingRoomCardInterface {
  data: GetBooking;
}

export default function BookingRoomCard({ data }: BookingRoomCardInterface) {
  const { room } = data;

  if (!room) {
    return <Text>Loading...</Text>;
  }
  return (
    <View style={[s.container]}>
      <View>
        <PressableImageFullscreen
          image={room?.thumbnail?.[0] ?? null}
          containerStyle={{ width: "100%", aspectRatio: 2 }}
          imageStyleConfig={{
            resizeMode: "cover",
            containerStyle: { borderRadius: BorderRadius.md },
          }}
        />
      </View>
      <View style={[s.floating_container]}>
        <HStack>
          <Ionicons
            name="home"
            size={Fontsize.h1}
            color={Colors.PrimaryLight[1]}
          />
          <Text style={[s.text_color, s.boardingHouse_name]}>
            {room?.roomNumber}
          </Text>
        </HStack>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderWidth: 1,
    position: "relative",
  },

  floating_container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderWidth: 2,
  },

  boardingHouse_name: {
    fontSize: Fontsize.h2,
    fontWeight: "900",
  },

  text_color: {
    color: Colors.TextInverse[2],
  },
});
