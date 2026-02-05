import React from "react";
import { View, Pressable } from "react-native";
import Svg, { Path, Rect, Defs, ClipPath } from "react-native-svg";
import { HStack } from "@gluestack-ui/themed";
import { Spacing } from "@/constants";

interface RatingStarInputInterface {
  value: number; // 0–5 (can be fractional)
  onChange: (value: number) => void;

  size?: number;
  starFilledColor: string;
  starHollowedColor: string;
  disabled?: boolean;
}

const STAR_PATH =
  "M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.168L12 18.897l-7.334 3.863 1.4-8.168L.132 9.21l8.2-1.192z";

export default function RatingStarInput({
  value,
  onChange,
  size = 25,
  starFilledColor,
  starHollowedColor,
  disabled = false,
}: RatingStarInputInterface) {
  return (
    <HStack style={{ gap: Spacing.xs }}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starIndex = index + 1;

        // Determine fill ratio for this star (0 → 1)
        const fill =
          value >= starIndex
            ? 1
            : value >= starIndex - 1
              ? value - (starIndex - 1)
              : 0;

        const clipId = `clip-input-star-${index}`;

        return (
          <Pressable
            key={starIndex}
            hitSlop={8}
            disabled={disabled}
            onPress={() => onChange(starIndex)}
          >
            <View style={{ width: size, height: size }}>
              <Svg width="100%" height="100%" viewBox="0 0 24 24">
                <Defs>
                  <ClipPath id={clipId}>
                    <Rect x="0" y="0" width={24 * fill} height="24" />
                  </ClipPath>
                </Defs>

                {/* Hollow star */}
                <Path d={STAR_PATH} fill={starHollowedColor} />

                {/* Filled portion */}
                {fill > 0 && (
                  <Path
                    d={STAR_PATH}
                    fill={starFilledColor}
                    clipPath={`url(#${clipId})`}
                  />
                )}
              </Svg>
            </View>
          </Pressable>
        );
      })}
    </HStack>
  );
}
