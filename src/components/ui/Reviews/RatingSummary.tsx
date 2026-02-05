import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import RatingStarRatio from "./RatingStarRatio";
import { StarDistribution } from "@/infrastructure/reviews/review.star-rating.service";
import { Colors, Fontsize, Spacing } from "@/constants";
import { ReviewSummary } from "@/infrastructure/reviews/reviews.schema";
import type { ReviewSummarySchema } from "../../../infrastructure/reviews/reviews.schema";

interface RatingSummarInterface {
  starFilledColor: string;
  starHollowedColor: string;
  metaData: ReviewSummary;
  //   averageRating: number;
  // total: number;
  // distribution: Record<string, number>;
}

export default function RatingSummar({
  starFilledColor,
  starHollowedColor,
  metaData: { average, distribution, total },
}: RatingSummarInterface) {
  const size = Fontsize.sm;

  // Convert backend distribution object to array for the bars
  const computedDistribution: StarDistribution[] = Object.entries(distribution)
    .map(([star, countStr]) => {
      const count = Number(countStr);
      const percentage = total > 0 ? count / total : 0;
      return { star: Number(star), count, percentage };
    })
    .sort((a, b) => b.star - a.star); // descending stars

  return (
    <Box style={[s.container]}>
      {/* Average rating */}
      <VStack style={[s.star_ratio_con]}>
        <Text style={[s.ratio_text, s.text_color]}>{average}</Text>
        <View style={{ marginTop: "auto" }}>
          <RatingStarRatio
            starFilledColor={starFilledColor}
            starHollowedColor={starHollowedColor}
            rating={average}
            size={size}
          />
          <Text style={[s.text_color]}>{total}</Text>
        </View>
      </VStack>

      {/* Distribution bars */}
      <VStack flex={1} style={[s.distributionBars_container]}>
        {computedDistribution.map((d) => (
          <HStack key={d.star} style={[s.distributionBars_container_rows]}>
            <Text style={[s.text_color]}>{d.star}</Text>
            <Box
              flex={1}
              height={10}
              backgroundColor={starHollowedColor}
              borderRadius={5}
              overflow="hidden"
            >
              <Box
                width={`${d.percentage * 100}%`}
                height="100%"
                backgroundColor={starFilledColor}
              />
            </Box>
            {/* Optional: <Text>{d.count}</Text> */}
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
