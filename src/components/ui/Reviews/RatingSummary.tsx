import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import RatingStarRatio from "./RatingStarRatio";
import { computeStarDistribution } from "@/infrastructure/reviews/review.star-rating.service";
import { Colors, Fontsize, Spacing } from "@/constants";

const reviews = [
  { rating: 5 },
  { rating: 5 },
  { rating: 4 },
  { rating: 3 },
  { rating: 1 },
];

export default function RatingSummar() {
  const size = Fontsize.sm;
  const color = "gold";
  const rating = 3.6;
  const distribution = computeStarDistribution(reviews);
  const totalReviews = 5;

  return (
    <Box style={[s.container]}>
      {/* Average rating */}
      <VStack style={[s.star_ratio_con]}>
        <Text style={[s.ratio_text, s.text_color]}>{rating}</Text>
        <View style={{ marginTop: "auto" }}>
          <RatingStarRatio color={color} rating={rating} size={size} />
          <Text style={[s.text_color]}>{totalReviews}</Text>
        </View>
      </VStack>

      {/* Distribution bars */}
      <VStack flex={1} style={[s.distributionBars_container]}>
        {distribution.map((d) => (
          <HStack key={d.star} style={[s.distributionBars_container_rows]}>
            <Text style={[s.text_color]}>{d.star}</Text>
            <Box
              flex={1}
              height={10}
              backgroundColor="#ddd"
              borderRadius={5}
              overflow="hidden"
            >
              <Box
                width={`${d.percentage * 100}%`}
                height="100%"
                backgroundColor={color}
              />
            </Box>
            {/* <Text>{d.count}</Text> */}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.md,
  },

  star_ratio_con: {
    alignItems: "flex-start",
    aspectRatio: 1,
    // borderWidth: 1,
    gap: 0,
  },

  ratio_text: {
    fontSize: Fontsize.display2,
  },

  distributionBars_container: {
    gap: Spacing.xs,
  },
  distributionBars_container_rows: {
    gap: Spacing.xs,
    alignItems: "center",
  },

  text_color: {
    color: Colors.TextInverse[1],
  },
});
