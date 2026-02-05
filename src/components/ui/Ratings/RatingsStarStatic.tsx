import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Colors, Spacing } from "@/constants";
import { HStack } from "@gluestack-ui/themed";
import RatingStarRatio from "../Reviews/RatingStarRatio";

interface RatingsStarStaticInterface {
  star: number;
  starFilledColor: string;
  starHollowedColor: string;
}

export default function RatingsStarStatic({
  star,
  starFilledColor,
  starHollowedColor,
}: RatingsStarStaticInterface) {
  const size = 10;
  return (
    <HStack>
      <RatingStarRatio
        size={size}
        rating={star}
        starFilledColor={starFilledColor}
        starHollowedColor={starHollowedColor}
      />
    </HStack>
  );
}

const s = StyleSheet.create({
  text_color: {
    color: Colors.TextInverse[1],
  },
});
