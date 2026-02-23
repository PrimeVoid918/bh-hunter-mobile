import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  useTheme,
  Button,
  HelperText,
  Surface,
} from "react-native-paper";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Review,
  UpdateReviewInput,
  UpdateReviewSchema,
} from "@/infrastructure/reviews/reviews.schema";
import { usePatchMutation } from "@/infrastructure/reviews/reviews.redux.api";
import { FormField } from "../FormFields/FormField";
import RatingStarInput from "../Ratings/RatingStarInput";
import { Spacing, BorderRadius } from "@/constants";

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
  const theme = useTheme();
  const [updateReview, { isLoading }] = usePatchMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateReviewInput>({
    resolver: zodResolver(UpdateReviewSchema),
    defaultValues: {
      rating: initialReview.rating,
      comment: initialReview.comment ?? "",
    },
  });

  const onSubmit = (data: UpdateReviewInput) => {
    Alert.alert(
      "Save Changes?",
      "Update your review? This will overwrite your previous feedback.",
      [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              await updateReview({
                id: initialReview.id,
                boardingHouseId: initialReview.boardingHouseId,
                data,
              }).unwrap();
              onSubmitSuccess();
            } catch (e: any) {
              Alert.alert("Error", e?.data?.message || "Failed to update.");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={s.root}>
      {/* 1. Rating Selector Section */}
      <View style={s.ratingSection}>
        <Text variant="labelLarge" style={s.label}>
          Tap to rate
        </Text>
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
        {errors.rating && (
          <HelperText type="error">{errors.rating.message}</HelperText>
        )}
      </View>

      {/* 2. Comment Field */}
      <View style={s.fieldSection}>
        <Text variant="labelLarge" style={s.label}>
          Describe your experience
        </Text>
        <FormField
          name="comment"
          control={control}
          isEditing={true}
          inputType="paragraph"
          placeholder="What did you like or dislike?"
          containerStyle={s.formFieldContainer}
          inputProps={{ multiline: true, numberOfLines: 5 }}
        />
      </View>

      {/* 3. Action Buttons */}
      <View style={s.actions}>
        <Button mode="text" onPress={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          style={s.button}
        >
          Update Review
        </Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: Spacing.lg, width: "100%" },
  ratingSection: { alignItems: "center", gap: Spacing.xs },
  fieldSection: { gap: Spacing.xs },
  label: { opacity: 0.7, marginBottom: 4, textAlign: "center" },
  formFieldContainer: { minHeight: 120 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
  },
  button: { borderRadius: BorderRadius.pill },
});
