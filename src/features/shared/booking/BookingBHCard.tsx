import React from "react";
import { View, StyleSheet, Vibration } from "react-native";
import {
  Text,
  Surface,
  useTheme,
  TouchableRipple,
  Icon,
} from "react-native-paper";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { Spacing } from "@/constants";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";

export default function BookingBHCard({
  data,
  onPress,
}: {
  data: GetBooking;
  onPress?: () => void;
}) {
  const { boardingHouse } = data;
  const theme = useTheme();

  const handlePress = () => {
    Vibration.vibrate(10);
    onPress?.();
  };

  return (
    <Surface
      style={[s.container, { borderColor: theme.colors.outlineVariant }]}
      elevation={0}
    >
      <PressableImageFullscreen
        image={boardingHouse?.thumbnail?.[0] ?? null}
        containerStyle={s.imageContainer}
        imageStyleConfig={{ resizeMode: "cover" }}
      />

      <TouchableRipple onPress={handlePress} rippleColor="rgba(0, 0, 0, .05)">
        <View style={s.textContainer}>
          <View style={s.content}>
            <Text style={[s.name, { color: theme.colors.onSurface }]}>
              {boardingHouse?.name}
            </Text>
            <View style={s.locationWrapper}>
              <Icon
                source="map-marker-outline"
                size={14}
                color={theme.colors.primary}
              />
              <Text style={[s.location, { color: theme.colors.outline }]}>
                {boardingHouse?.address || "Ormoc City"}
              </Text>
            </View>
          </View>

          {/* Nav Indicator */}
          <View
            style={[
              s.actionIndicator,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Icon
              source="arrow-top-right"
              size={18}
              color={theme.colors.onPrimaryContainer}
            />
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 16, // xl
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 21 / 9,
  },
  textContainer: {
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
  },
  name: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  location: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  actionIndicator: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.md,
  },
});
