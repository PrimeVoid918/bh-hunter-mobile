import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Divider,
  useTheme,
  Surface,
  TouchableRipple,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HStack, VStack } from "@gluestack-ui/themed";

import { Fontsize, Spacing, BorderRadius } from "@/constants";
import {
  useGetAllQuery,
  useGetReviewSummaryQuery,
} from "@/infrastructure/reviews/reviews.redux.api";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";

import RatingSummary from "./RatingSummary";
import ReviewItem from "./ReviewItem";
import ReviewSubmissionHandler from "./ReviewSubmissionHandler";

interface ReviewSectionInterface {
  isOwner?: boolean;
  boardingHouseId?: number;
}

export default function ReviewSection({
  boardingHouseId,
  isOwner,
}: ReviewSectionInterface) {
  const { colors } = useTheme();

  // Data Fetching
  const {
    data: reviewsData,
    refetch,
    isLoading,
  } = useGetAllQuery(boardingHouseId!);
  const { data: reviewSummaryData } = useGetReviewSummaryQuery(
    boardingHouseId!,
  );
  const { selectedUser: userData } = useDynamicUserApi();

  const currentUserId = userData?.id;
  const myReview = !isOwner
    ? reviewsData?.find((r) => r.tenantId === currentUserId)
    : undefined;
  const displayReviews = !isOwner
    ? reviewsData?.filter((r) => r.tenantId !== currentUserId)
    : reviewsData;

  // Star Colors from Theme
  const starFilledColor = colors.secondary; // #FDD85D
  const starHollowedColor = colors.outlineVariant; // #CCCCCC

  return (
    <VStack style={s.mainContainer}>
      {/* SECTION HEADER */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        style={s.headerRow}
      >
        <VStack>
          <Text style={s.title}>Ratings & reviews</Text>
          <Text variant="labelSmall" style={{ color: colors.outline }}>
            Verified feedback from Ormoc tenants
          </Text>
        </VStack>
        {/* <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.outline}
        /> */}
      </HStack>

      {/* RATING SUMMARY CARD */}
      <Surface style={s.summaryCard} elevation={0}>
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
        />
      </Surface>

      {/* USER'S PERSONAL ACTION AREA */}
      {!isOwner && (
        <VStack style={s.submissionArea}>
          <Text variant="titleSmall" style={s.subTitle}>
            {myReview ? "Your Review" : "Rate this property"}
          </Text>
          <ReviewSubmissionHandler
            boardingHouseId={boardingHouseId!}
            myReview={myReview}
            starFilledColor={starFilledColor}
            starHollowedColor={starHollowedColor}
            onReviewChange={refetch}
          />
        </VStack>
      )}

      <Divider style={s.divider} />

      {/* REVIEWS LIST */}
      <VStack style={s.reviewsList}>
        {displayReviews && displayReviews.length > 0 ? (
          displayReviews.map((item, index) => (
            <VStack key={item.id || index}>
              <ReviewItem
                review={item}
                starFilledColor={starFilledColor}
                starHollowedColor={starHollowedColor}
              />
              {index < displayReviews.length - 1 && (
                <Divider style={s.itemDivider} />
              )}
            </VStack>
          ))
        ) : (
          <View style={s.emptyState}>
            <MaterialCommunityIcons
              name="message-draw"
              size={48}
              color={colors.surfaceVariant}
            />
            {/* <Text
              variant="bodyMedium"
              style={{ color: colors.outline, marginTop: 8 }}
            >
              No reviews yet. Be the first to share!
            </Text> */}
          </View>
        )}
      </VStack>
    </VStack>
  );
}

const s = StyleSheet.create({
  mainContainer: {
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  headerRow: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Fontsize.xl,
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  summaryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC", // outlineVariant
    backgroundColor: "#FFFFFF",
  },
  submissionArea: {
    paddingHorizontal: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  subTitle: {
    fontFamily: "Poppins-SemiBold",
    marginBottom: Spacing.xs,
  },
  reviewsList: {
    gap: Spacing.md,
  },
  divider: {
    marginVertical: Spacing.sm,
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  itemDivider: {
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    opacity: 0.5,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
    opacity: 0.6,
  },
});
