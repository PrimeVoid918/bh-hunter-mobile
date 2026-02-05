import { View, Text, Pressable, Alert } from "react-native";
import React from "react";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import { Review } from "@/infrastructure/reviews/reviews.schema";
import { ReviewInputMode } from "./types";
import { CreateReviewComponent } from "./CraeteReviewComponent";
import EditReviewComponent from "./EditReviewComponent";
import FormStateActionsButton from "../Buttons/FormStateActionsButton";
import ReviewItem from "./ReviewItem";
import { useDeleteMutation } from "@/infrastructure/reviews/reviews.redux.api";

interface ReviewSubmissionHandlerInterface {
  boardingHouseId?: number;
  myReview?: Review; // undefined = no review yet
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
  const [mode, setMode] = React.useState<ReviewInputMode>("creating");

  React.useEffect(() => {
    if (myReview) {
      setMode("viewing");
    } else {
      // If there is no review, we should be in creating mode
      setMode("creating");
    }
  }, [myReview]);

  console.log("mode: ", mode);

  const [rating, setRating] = React.useState(myReview?.rating ?? 0);
  const [comment, setComment] = React.useState(myReview?.comment ?? "");

  const [deleteReview, { isLoading: isDeleting }] = useDeleteMutation();

  function handleDelete() {
    if (!myReview?.id) return;

    Alert.alert(
      "Delete Review?",
      "This will permanently remove your feedback. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive", // On iOS, this turns the button text red
          onPress: async () => {
            try {
              // 2. Execute the mutation
              await deleteReview({
                id: myReview.id,
                boardingHouseId: myReview.boardingHouseId,
              }).unwrap();

              Alert.alert("Deleted", "Your review has been removed.", [
                {
                  text: "OK",
                  onPress: () => {
                    // 3. Switch back to creating mode so they can write a new one
                    setMode("creating");
                    onReviewChange?.();
                  },
                },
              ]);
            } catch (e: any) {
              const errorMessage =
                e?.data?.message || "Could not delete review.";
              Alert.alert("Delete Failed", errorMessage);
            }
          },
        },
      ],
    );
  }

  return (
    <VStack style={[s.container]}>
      {mode === "creating" && (
        <VStack style={{ gap: Spacing.lg }}>
          <VStack style={[s.creating]}>
            <Text style={[s.text_color, s.state_header]}>
              Your feedback helps others choose the right place.
            </Text>
            <Text style={[s.text_color, s.state_subHeader]}>
              Write a quick review.
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
        </VStack>
      )}

      {mode === "editing" && myReview && (
        <VStack style={{ gap: Spacing.lg }}>
          <VStack style={[s.editing]}>
            <VStack style={[s.editing]}>
              <Text style={[s.text_color, s.state_header]}>
                Modify your review.
              </Text>
              <Text style={[s.text_color, s.state_subHeader]}>
                Your updates help keep the community informed.
              </Text>
            </VStack>

            <EditReviewComponent
              initialReview={myReview}
              onCancel={() => setMode("viewing")}
              onSubmitSuccess={() => setMode("viewing")}
              starFilledColor={starFilledColor}
              starHollowedColor={starHollowedColor}
            />
          </VStack>
        </VStack>
      )}

      {mode === "viewing" && myReview && (
        <VStack style={[s.view]}>
          <Text
            style={[s.text_color, { fontSize: Fontsize.lg, fontWeight: "900" }]}
          >
            Your Review
          </Text>
          <View style={{ gap: 12 }}>
            <ReviewItem
              review={myReview}
              starFilledColor={starFilledColor}
              starHollowedColor={starHollowedColor}
            />

            {/* Actions */}
            <HStack style={{ gap: Spacing.md, marginLeft: "auto" }}>
              <FormStateActionsButton
                label="Edit"
                variant="primary"
                onPress={() => setMode("editing")}
              />

              <FormStateActionsButton
                label="Delete"
                variant="danger"
                onPress={handleDelete}
              />
            </HStack>
          </View>
        </VStack>
      )}
    </VStack>
  );
}

const s = StyleSheet.create({
  view: {},
  editing: {
    justifyContent: "center",
    alignItems: "center",
  },
  creating: {
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 3,
  },

  state_header: {
    // borderWidth: 3,
    fontSize: Fontsize.h2,
    fontWeight: "900",
    textAlign: "center",
    width: "90%",
  },

  state_subHeader: {
    fontSize: Fontsize.md,
    fontWeight: "900",
    textAlign: "center",
  },

  container: {
    marginTop: Spacing.lg,
    justifyContent: "center",
    // align
    borderRadius: BorderRadius.sm,
    // padding: Spacing.sm,
  },

  text_color: {
    color: Colors.TextInverse[1],
  },
});

/**
 * (no review)
 *  └── idle
 *        └── tap "Write a review"
 *              └── creating
 *                    ├── submit → viewing
 *                    └── cancel → idle
 *
 *(has review)
 *  └── viewing
 *        ├── tap "Edit" → editing
 *        └── tap "Delete" → idle
 *
 *(editing)
 *  ├── save → viewing
 *  └── cancel → viewing
 *
 */
