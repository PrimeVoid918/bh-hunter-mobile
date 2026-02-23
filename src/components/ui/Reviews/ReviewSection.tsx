import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { Colors, Fontsize, Spacing } from "@/constants";
import ReviewItem from "./ReviewItem";
import ReviewSubmissionHandler from "./ReviewSubmissionHandler";
import RatingSummary from "./RatingSummary";
import {
  useGetAllQuery,
  useGetReviewSummaryQuery,
} from "@/infrastructure/reviews/reviews.redux.api";
import { Lists } from "@/components/layout/Lists/Lists";
import { ReviewSummary } from "@/infrastructure/reviews/reviews.schema";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { Divider } from "react-native-paper";

interface ReviewSectionInterface {
  isOwner?: boolean;
  boardingHouseId?: number;
}

export default function ReviewSection({
  boardingHouseId,
  isOwner,
}: ReviewSectionInterface) {
  const {
    data: reviewsData,
    isError: isReviewDataError,
    isLoading: isReviewDataLoading,
    error,
    refetch,
  } = useGetAllQuery(boardingHouseId!);

  const { data: reviewSummaryData } = useGetReviewSummaryQuery(
    boardingHouseId!,
  );

  // 1. Identify if the user has already reviewed this place
  const { selectedUser: userData } = useDynamicUserApi();
  const currentUserId = userData!.id;

  const myReview = !isOwner
    ? reviewsData?.find((r) => r.tenantId === currentUserId)
    : undefined;

  const displayReviews = !isOwner
    ? reviewsData?.filter((r) => r.tenantId !== currentUserId) // Exclude mine
    : reviewsData; // Owner sees everything

  // console.log("Others reviews: ", otherReviews);

  const starFilledColor = Colors.PrimaryLight[1];
  const starHollowedColor = Colors.PrimaryLight[8];

  return (
    <View style={[, s.container]}>
      <Text style={{ fontSize: Fontsize.h2, color: Colors.TextInverse[1] }}>
        Ratings and reviews
      </Text>
      <RatingSummary
        starFilledColor={starFilledColor}
        starHollowedColor={starHollowedColor}
        metaData={
          reviewSummaryData ?? {
            average: 0,
            total: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          }
        }
      ></RatingSummary>

      <Divider bold />
      {!isOwner && (
        <ReviewSubmissionHandler
          boardingHouseId={boardingHouseId!}
          myReview={myReview}
          starFilledColor={starFilledColor}
          starHollowedColor={starHollowedColor}
          onReviewChange={refetch} //
        ></ReviewSubmissionHandler>
      )}
      <Divider bold/>

      {reviewsData ? (
        <Lists
          list={displayReviews!}
          renderItem={({ item, index }) => (
            <ReviewItem
              review={item}
              starFilledColor={starFilledColor}
              starHollowedColor={starHollowedColor}
            ></ReviewItem>
          )}
        />
      ) : (
        <View>
          <Text>No Reviews Yet...</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingTop: Spacing.md,
    gap: Spacing.md,

    // borderWidth: 3,
    // borderColor: "red",
  },
  text_color: {
    color: Colors.TextInverse[1],
  },

  comment_container: {
    // borderWidth: 4,
  },
  commentor_nameContainer: {
    marginLeft: Spacing.md,
    // borderWidth: 4,
  },
  commentor_name: {
    fontWeight: "900",
    fontSize: Fontsize.xl,
  },
});
