import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Button,
  useTheme,
  Surface,
  IconButton,
} from "react-native-paper";
import { Spacing, Colors, Fontsize, BorderRadius } from "@/constants";
import { Review } from "@/infrastructure/reviews/reviews.schema";
import { ReviewInputMode } from "./types";
import { CreateReviewComponent } from "./CraeteReviewComponent";
import EditReviewComponent from "./EditReviewComponent";
import ReviewItem from "./ReviewItem";
import { useDeleteMutation } from "@/infrastructure/reviews/reviews.redux.api";

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
  const theme = useTheme();
  const [mode, setMode] = React.useState<ReviewInputMode>("creating");
  const [deleteReview] = useDeleteMutation();

  React.useEffect(() => {
    setMode(myReview ? "viewing" : "creating");
  }, [myReview]);

  const handleDelete = () => {
    if (!myReview?.id) return;
    Alert.alert(
      "Delete Review?",
      "This feedback will be removed permanently.",
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
    );
  };

  return (
    <View style={s.root}>
      {mode === "creating" && (
        <View style={s.centerContent}>
          <Text variant="titleMedium" style={s.headerText}>
            How was your stay?
          </Text>
          <Text variant="bodyMedium" style={s.subHeaderText}>
            Share your experience to help others find a home.
          </Text>
          <View style={s.formWrapper}>
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
          </View>
        </View>
      )}

      {mode === "editing" && myReview && (
        <View style={s.centerContent}>
          <Text variant="titleMedium" style={s.headerText}>
            Update your review
          </Text>
          <View style={s.formWrapper}>
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
          </View>
        </View>
      )}

      {mode === "viewing" && myReview && (
        <Surface
          mode="flat" // Forces the MD3 engine to stop adding tinted overlays
          elevation={4}
          style={s.userReviewCard}
        >
          <View style={s.cardHeader}>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
              Your Review
            </Text>
            <View style={s.actionRow}>
              <Button compact mode="text" onPress={() => setMode("editing")}>
                Edit
              </Button>
              <Button
                compact
                mode="text"
                textColor={theme.colors.error}
                onPress={handleDelete}
              >
                Delete
              </Button>
            </View>
          </View>
          <ReviewItem
            review={myReview}
            starFilledColor={starFilledColor}
            starHollowedColor={starHollowedColor}
          />
        </Surface>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    marginVertical: Spacing.md,
  },
  centerContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  headerText: {
    fontWeight: "700",
    color: Colors.TextInverse[1],
    textAlign: "center",
  },
  subHeaderText: {
    color: Colors.TextInverse[1],
    opacity: 0.7,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  formWrapper: {
    width: "100%",
  },
  userReviewCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.05)", // Subtle surface for dark mode
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
  },
});
