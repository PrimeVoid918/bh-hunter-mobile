import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";
import { BorderRadius, BorderWidth, ShadowLight, Spacing } from "@/constants";
import { useTheme } from "react-native-paper"; // Grab your custom theme
import PressableImageFullscreen from "./ImageComponentUtilities/PressableImageFullscreen";

interface CarouselProps {
  images: Array<{ url: string | any } | undefined>;
  variant?: "primary" | "secondary";
  containerStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
}

export default function ImageCarousel({
  images,
  variant = "primary",
  scrollStyle,
  containerStyle,
}: CarouselProps) {
  const theme = useTheme();
  const [imageIndex, setImageIndex] = useState(0);

  const isRow = variant === "primary";

  // M3 Configuration: Logical and Clean
  const m3Config = {
    container: {
      borderRadius: BorderRadius.xl,
      backgroundColor: theme.colors.surface,
      // M3 uses thin outlines instead of thick borders
      borderWidth: BorderWidth.xs,
      borderColor: theme.colors.outlineVariant,
      overflow: "hidden" as const,
      ...ShadowLight.sm, // M3 shadows are subtle
    },
    mainImageContainer: {
      height: isRow ? 280 : "100%",
      aspectRatio: isRow ? 16 / 9 : undefined,
      backgroundColor: theme.colors.surfaceVariant,
      flex: isRow ? undefined : 1,
    },
    thumbnail: (isActive: boolean) => ({
      width: 72, // Consistent M3 sizing
      height: 72,
      borderRadius: BorderRadius.md,
      borderWidth: isActive ? BorderWidth.lg : BorderWidth.xs,
      borderColor: isActive
        ? theme.colors.primary
        : theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceVariant,
    }),
  };

  const activeImage = images[imageIndex];

  return (
    <View
      style={[
        m3Config.container,
        isRow ? {} : { flexDirection: "row", height: 300 },
        containerStyle,
      ]}
    >
      {/* Main Image Area */}
      <View style={m3Config.mainImageContainer}>
        {!activeImage ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No Image
            </Text>
          </View>
        ) : (
          <PressableImageFullscreen
            image={activeImage}
            imageStyleConfig={{ resizeMode: "cover" }}
          />
        )}
      </View>

      {/* Thumbnails List */}
      <View>
        <ScrollView
          horizontal={isRow}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            {
              padding: Spacing.md,
              gap: Spacing.sm,
              flexDirection: isRow ? "row" : "column",
            },
            scrollStyle,
          ]}
        >
          {images.map((img, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setImageIndex(i)}
              activeOpacity={0.8}
            >
              <Image
                source={
                  typeof img?.url === "string" ? { uri: img.url } : img?.url
                }
                style={m3Config.thumbnail(i === imageIndex)}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
