import React, { useState, useRef } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Surface, Text, useTheme, TouchableRipple } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { BorderRadius, Spacing } from "@/constants";
import PressableImageFullscreen from "./ImageComponentUtilities/PressableImageFullscreen";

interface CarouselProps {
  images: Array<{ url: string | any } | undefined>;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ImageCarousel({ images }: CarouselProps) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter out undefined images
  const validImages = images.filter(
    (img): img is { url: string | any } => !!img,
  );

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  if (validImages.length === 0) {
    return (
      <Surface style={s.emptyContainer} elevation={0}>
        <MaterialCommunityIcons
          name="image-off-outline"
          size={32}
          color={colors.outline}
        />
        <Text variant="labelMedium" style={{ color: colors.outline }}>
          No Images Available
        </Text>
      </Surface>
    );
  }

  return (
    <Surface style={s.mainContainer} elevation={0}>
      {/* Main Horizontal List */}
      <FlatList
        data={validImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={s.slide}>
            <PressableImageFullscreen
              image={item}
              imageStyleConfig={{
                resizeMode: "cover",
                containerStyle: { width: "100%", height: "100%" },
              }}
            />
          </View>
        )}
      />

      {/* Floating Pagination Dots */}
      <View style={s.paginationContainer}>
        {validImages.map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor:
                  i === activeIndex ? colors.primary : colors.surface,
                width: i === activeIndex ? 12 : 6, // Active dot is wider
                borderColor: colors.outlineVariant,
                borderWidth: i === activeIndex ? 0 : 1,
              },
            ]}
          />
        ))}
      </View>

      {/* Index Badge */}
      <View style={[s.badge, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <Text style={s.badgeText}>
          {activeIndex + 1} / {validImages.length}
        </Text>
      </View>
    </Surface>
  );
}

const s = StyleSheet.create({
  mainContainer: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC", // outlineVariant
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F0F0F5", // surfaceVariant
  },
  emptyContainer: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  slide: {
    width: SCREEN_WIDTH - Spacing.md * 2 - 2, // Accounting for wrapper padding/borders
    height: "100%",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
});
