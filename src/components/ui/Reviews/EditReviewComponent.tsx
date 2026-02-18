import { View, Text, Alert } from "react-native";
import React from "react";
import { BorderRadius, Colors, Spacing } from "@/constants";
import { HStack, Button, ButtonText, VStack } from "@gluestack-ui/themed";
import {
  Review,
  UpdateReviewInput,
  UpdateReviewSchema,
} from "@/infrastructure/reviews/reviews.schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../FormFields/FormField";
import StarRatingInput from "./StarRatingInput";
import { usePatchMutation } from "@/infrastructure/reviews/reviews.redux.api";
import FormStateActionsButton from "../Buttons/FormStateActionsButton";
import RatingStarInput from "../Ratings/RatingStarInput";

interface EditReviewComponentProps {
  initialReview: Review;
  starFilledColor: string;
  starHollowedColor: string;
  onCancel: () => void;
  onSubmitSuccess: () => void;
}

export default function EditReviewComponent({
  initialReview,
  onCancel,
  onSubmitSuccess,
  starFilledColor,
  starHollowedColor,
}: EditReviewComponentProps) {
  const [updateReview, { isLoading }] = usePatchMutation();

  const { control, handleSubmit } = useForm<UpdateReviewInput>({
    resolver: zodResolver(UpdateReviewSchema),
    defaultValues: {
      rating: initialReview.rating,
      comment: initialReview.comment ?? "",
    },
  });

  const onSubmit = (data: UpdateReviewInput) => {
    Alert.alert(
      "Save Changes?",
      "Are you sure you want to update your review? This will overwrite your previous feedback.",
      [
        {
          text: "Keep Editing",
          style: "cancel",
        },
        {
          text: "Update",
          onPress: async () => {
            try {
              await updateReview({
                id: initialReview.id,
                boardingHouseId: initialReview.boardingHouseId,
                data,
              }).unwrap();

              Alert.alert(
                "Updated",
                "Your review has been modified successfully.",
                [{ text: "OK", onPress: onSubmitSuccess }],
              );
            } catch (e: any) {
              const msg = e?.data?.message || "Failed to update review.";
              Alert.alert("Error", msg);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ gap: 12 }}>
      <VStack
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text></Text>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <RatingStarInput
              value={field.value!}
              onChange={field.onChange}
              starFilledColor={starFilledColor}
              starHollowedColor={starHollowedColor}
            />
          )}
        />

        <FormField
          name="comment"
          control={control}
          isEditing={true}
          inputConfig={{
            inputType: "paragraph",
            placeholder: "...",
          }}
          containerStyle={{
            borderWidth: 3,
            marginTop: Spacing.md,
            width: "100%",
            minHeight: 150,
            borderRadius: BorderRadius.md,
          }}
        />
      </VStack>

      <HStack style={{ gap: Spacing.md, marginLeft: "auto" }}>
        <FormStateActionsButton
          label={"Cancel"}
          variant="primary"
          isLoading={isLoading}
          onPress={onCancel}
        />
        <FormStateActionsButton
          label={isLoading ? "Saving..." : "Save Changes"}
          variant="danger"
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
        />
      </HStack>
    </View>
  );
}
