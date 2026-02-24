import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, useTheme, Surface, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Spacing, BorderRadius } from "@/constants";
import { Review } from "@/infrastructure/reviews/reviews.schema";
import { ReviewInputMode } from "./types";
import { CreateReviewComponent } from "./CraeteReviewComponent";
import EditReviewComponent from "./EditReviewComponent";
import ReviewItem from "./ReviewItem";
import { useDeleteMutation } from "@/infrastructure/reviews/reviews.redux.api";
import { VStack, HStack } from "@gluestack-ui/themed";

interface ReviewSubmissionHandlerInterface {
  boardingHouseId?: number;
  myReview?: Review;
  starFilledColor: string;
  starHollowedColor: string;
  onReviewChange?: () => void;
}

export default function ReviewSubmissionHandler({
  boardingHouseId,
  myReview,
  starFilledColor,
  starHollowedColor,
  onReviewChange,
}: ReviewSubmissionHandlerInterface) {
  const { colors } = useTheme();
  const [mode, setMode] = React.useState<ReviewInputMode>("creating");
  const [deleteReview] = useDeleteMutation();

  React.useEffect(() => {
    setMode(myReview ? "viewing" : "creating");
  }, [myReview]);

  const handleDelete = () => {
    if (!myReview?.id) return;
    Alert.alert(
      "Delete Review",
      "This will permanently remove your feedback. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReview({
                id: myReview.id,
                boardingHouseId: myReview.boardingHouseId,
              }).unwrap();
              onReviewChange?.();
            } catch (e: any) {
              Alert.alert("Error", e?.data?.message || "Failed to delete.");
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <VStack style={s.root}>
      {mode === "creating" && (
        <Surface style={s.createCard} elevation={0}>
          <VStack gap={Spacing.xs} style={{ marginBottom: Spacing.md }}>
            <HStack alignItems="center" gap={8}>
              <MaterialCommunityIcons
                name="pencil-box-outline"
                size={20}
                color={colors.primary}
              />
              <Text variant="titleMedium" style={s.boldPoppins}>
                How was your stay?
              </Text>
            </HStack>
            <Text variant="bodySmall" style={{ color: colors.outline }}>
              Help the community by sharing your experience at this property.
            </Text>
          </VStack>

          <CreateReviewComponent
            boardingHouseId={boardingHouseId!}
            starFilledColor={starFilledColor}
            starHollowedColor={starHollowedColor}
            onSubmitSuccess={() => {
              setMode("viewing");
              onReviewChange?.();
            }}
            onCancel={() => setMode("creating")}
          />
        </Surface>
      )}

      {mode === "editing" && myReview && (
        <Surface style={s.editCard} elevation={0}>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            style={{ marginBottom: Spacing.md }}
          >
            <Text variant="titleMedium" style={s.boldPoppins}>
              Update your review
            </Text>
            <MaterialCommunityIcons
              name="file-edit-outline"
              size={20}
              color={colors.primary}
            />
          </HStack>
          <EditReviewComponent
            initialReview={myReview}
            onCancel={() => setMode("viewing")}
            onSubmitSuccess={() => {
              setMode("viewing");
              onReviewChange?.();
            }}
            starFilledColor={starFilledColor}
            starHollowedColor={starHollowedColor}
          />
        </Surface>
      )}

      {mode === "viewing" && myReview && (
        <Surface style={s.viewCard} elevation={0}>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            style={s.cardHeader}
          >
            <HStack alignItems="center" gap={6}>
              <MaterialCommunityIcons
                name="account-check"
                size={18}
                color={colors.success}
              />
              <Text
                variant="labelLarge"
                style={{
                  color: colors.onSurface,
                  fontFamily: "Poppins-Medium",
                }}
              >
                Your published review
              </Text>
            </HStack>
            <HStack>
              <Button
                compact
                mode="text"
                onPress={() => setMode("editing")}
                labelStyle={s.actionLabel}
              >
                Edit
              </Button>
              <Button
                compact
                mode="text"
                textColor={colors.error}
                onPress={handleDelete}
                labelStyle={s.actionLabel}
              >
                Delete
              </Button>
            </HStack>
          </HStack>

          <Divider style={{ marginBottom: Spacing.sm, opacity: 0.5 }} />

          <ReviewItem
            review={myReview}
            starFilledColor={starFilledColor}
            starHollowedColor={starHollowedColor}
          />
        </Surface>
      )}
    </VStack>
  );
}

const s = StyleSheet.create({
  root: {
    marginVertical: Spacing.sm,
  },
  boldPoppins: {
    fontFamily: "Poppins-SemiBold",
  },
  createCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "#CCCCCC", // outlineVariant
    backgroundColor: "#FFFFFF",
  },
  editCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: "#357FC1", // primary
    backgroundColor: "#FFFFFF",
  },
  viewCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#F7F9FC", // Slight tint to distinguish user review
  },
  cardHeader: {
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
});
