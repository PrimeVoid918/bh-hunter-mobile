import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, IconButton } from "react-native-paper";
import { HStack, VStack } from "@gluestack-ui/themed";

import { Fontsize, Spacing } from "@/constants";
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
  const { colors } = useTheme();
  const relativeDate = getRelativeTime(review.createdAt);

  return (
    <VStack style={s.itemContainer}>
      <HStack justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" gap={Spacing.md}>
          <ImageUserPFP height={40} />
          <VStack>
            <HStack gap={Spacing.xs}>
              <Text style={s.userName}>{review.tenant.firstname}</Text>
              <Text style={s.userName}>{review.tenant.lastname}</Text>
            </HStack>
            <HStack alignItems="center" gap={Spacing.sm}>
              <RatingsStarStatic
                star={review.rating}
                starFilledColor={starFilledColor}
                starHollowedColor={starHollowedColor}
                size={12}
              />
              <Text style={s.dateText}>{relativeDate}</Text>
            </HStack>
          </VStack>
        </HStack>

        <IconButton
          icon="dots-vertical"
          size={20}
          onPress={() => {}}
          iconColor={colors.outline}
          style={{ margin: 0 }}
        />
      </HStack>

      <View style={s.commentBody}>
        <Text style={s.commentText}>
          {review.comment || "No written review provided."}
        </Text>
      </View>
    </VStack>
  );
}

const s = StyleSheet.create({
  itemContainer: {
    paddingVertical: Spacing.sm,
    backgroundColor: "transparent",
  },
  userName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: Fontsize.md,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  dateText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
    letterSpacing: 0.2,
  },
  commentBody: {
    marginTop: Spacing.sm,
    paddingLeft: 40 + Spacing.md,
  },
  commentText: {
    fontFamily: "Poppins-Regular",
    fontSize: Fontsize.md,
    lineHeight: 22,
    color: "#3A3A3A",
  },
});
