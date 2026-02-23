import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { Colors, Fontsize, Spacing, BorderRadius } from "@/constants";
import ImageUserPFP from "../ImageComponentUtilities/ImageUserPFP";
import RatingsStarStatic from "../Ratings/RatingsStarStatic";
import { Review } from "@/infrastructure/reviews/reviews.schema";
import { getRelativeTime } from "@/infrastructure/utils/date-and-time/relative-time.util";

interface ReviewItemInterface {
  review: Review;
  starFilledColor: string;
  starHollowedColor: string;
}

export default function ReviewItem({
  review,
  starFilledColor,
  starHollowedColor,
}: ReviewItemInterface) {
  // Logic: Using your getRelativeTime for that "Smart Day" measurement
  const relativeDate = getRelativeTime(review.createdAt);

  return (
    <Box style={s.comment_container}>
      <HStack style={s.header_row}>
        {/* User Avatar - Slightly smaller for M3 feel */}
        <ImageUserPFP height={36} />

        <VStack style={s.commentor_infoContainer}>
          <HStack style={s.name_date_row}>
            <Text style={[s.text_color, s.commentor_name]}>
              {review.tenant.username}
            </Text>
            {/* Options button usually goes here in Play Store */}
          </HStack>

          <HStack style={s.rating_date_row}>
            <RatingsStarStatic
              star={review.rating}
              starFilledColor={starFilledColor}
              starHollowedColor={starHollowedColor}
              size={12} // Smaller stars look more professional
            />
            <Text style={s.date_text}>{relativeDate}</Text>
          </HStack>
        </VStack>
      </HStack>

      {/* Review Body - Full width below the avatar for better readability */}
      <View style={s.comment_body}>
        <Text style={[s.text_color, s.comment_text]}>{review.comment}</Text>
      </View>
    </Box>
  );
}

const s = StyleSheet.create({
  comment_container: {
    paddingVertical: Spacing.md,
    backgroundColor: "transparent",
  },
  header_row: {
    alignItems: "center",
    gap: Spacing.md,
  },
  commentor_infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name_date_row: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating_date_row: {
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 2,
  },
  commentor_name: {
    fontWeight: "700",
    fontSize: Fontsize.md,
    color: Colors.TextInverse[1],
  },
  date_text: {
    fontSize: 12,
    color: Colors.TextInverse[1],
    opacity: 0.6,
  },
  comment_body: {
    paddingTop: Spacing.sm,
    // Aligning text with the start of the name rather than the avatar
    paddingLeft: 36 + Spacing.md,
  },
  comment_text: {
    fontSize: Fontsize.md,
    lineHeight: 20,
    opacity: 0.9,
  },
  text_color: {
    color: Colors.TextInverse[1],
  },
});
