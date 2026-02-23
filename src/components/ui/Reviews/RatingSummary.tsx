import { View, StyleSheet } from "react-native";
import React from "react";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { Text, useTheme } from "react-native-paper";
import RatingStarRatio from "./RatingStarRatio";
import { StarDistribution } from "@/infrastructure/reviews/review.star-rating.service";
import { Colors, Fontsize, Spacing, BorderRadius } from "@/constants";
import { ReviewSummary } from "@/infrastructure/reviews/reviews.schema";

interface RatingSummarInterface {
  starFilledColor: string;
  starHollowedColor: string;
  metaData: ReviewSummary;
}

export default function RatingSummary({
  starFilledColor,
  starHollowedColor,
  metaData: { average, distribution, total },
}: RatingSummarInterface) {
  const theme = useTheme();

  const computedDistribution: StarDistribution[] = Object.entries(distribution)
    .map(([star, countStr]) => {
      const count = Number(countStr);
      const percentage = total > 0 ? count / total : 0;
      return { star: Number(star), count, percentage };
    })
    .sort((a, b) => b.star - a.star);

  return (
    <Box style={s.container}>
      {/* Left Side: The Hero Rating */}
      <VStack style={s.scoreSection}>
        <Text style={s.averageText}>
          {average.toFixed(1)}
        </Text>
        <RatingStarRatio
          starFilledColor={starFilledColor}
          starHollowedColor={starHollowedColor}
          rating={average}
          size={14}
        />
        <Text variant="labelSmall" style={s.totalText}>
          {total.toLocaleString()} reviews
        </Text>
      </VStack>

      {/* Right Side: The Distribution Chart */}
      <VStack style={s.chartSection}>
        {computedDistribution.map((d) => (
          <HStack key={d.star} style={s.barRow}>
            <Text variant="labelMedium" style={s.starNumber}>
              {d.star}
            </Text>
            <View style={s.barBackground}>
              <View
                style={[
                  s.barFill,
                  { 
                    width: `${d.percentage * 100}%`, 
                    backgroundColor: starFilledColor 
                  },
                ]}
              />
            </View>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
  },
  scoreSection: {
    alignItems: "center",
    justifyContent: "center",
    width: 100, // Fixed width for alignment
    gap: 4,
  },
  averageText: {
    fontSize: 56, // Large display size
    fontWeight: "700",
    lineHeight: 60,
    color: Colors.TextInverse[1],
  },
  totalText: {
    opacity: 0.6,
    marginTop: 2,
    color: Colors.TextInverse[1],
  },
  chartSection: {
    flex: 1,
    gap: 4, // Tight gaps like Play Store
    paddingLeft: Spacing.md,
  },
  barRow: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  starNumber: {
    width: 10,
    textAlign: "center",
    opacity: 0.8,
    color: Colors.TextInverse[1],
  },
  barBackground: {
    flex: 1,
    height: 8, // Thinner bars look more modern
    backgroundColor: "rgba(0,0,0,0.05)", // Very subtle track
    borderRadius: BorderRadius.pill,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: BorderRadius.pill,
  },
});