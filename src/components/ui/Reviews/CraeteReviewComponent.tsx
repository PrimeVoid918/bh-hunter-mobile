import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, HelperText, useTheme } from "react-native-paper";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateReviewInput,
  CreateReviewSchema,
} from "@/infrastructure/reviews/reviews.schema";
import { useCreateMutation } from "@/infrastructure/reviews/reviews.redux.api";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { FormField } from "../FormFields/FormField";
import RatingStarInput from "../Ratings/RatingStarInput";
import { Spacing, BorderRadius } from "@/constants";

interface CreateReviewComponentInterface {
  boardingHouseId: number;
  starFilledColor: string;
  starHollowedColor: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function CreateReviewComponent({
  boardingHouseId,
  starFilledColor,
  starHollowedColor,
  onCancel,
  onSubmitSuccess,
}: CreateReviewComponentInterface) {
  const theme = useTheme();
  const { selectedUser: userData } = useDynamicUserApi();
  const currentUser = userData!.id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(CreateReviewSchema),
    defaultValues: {
      tenantId: currentUser,
      rating: 0, // Start at 0 to encourage a conscious choice
      comment: "",
    },
  });

  const [createReview, { isLoading }] = useCreateMutation();

  const onSubmit = (data: CreateReviewInput) => {
    if (data.rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }

    Alert.alert("Post Review?", "Share your feedback with the community?", [
      { text: "Not yet", style: "cancel" },
      {
        text: "Post now",
        onPress: async () => {
          try {
            await createReview({ boardingHouseId, data }).unwrap();
            reset();
            onSubmitSuccess();
          } catch (e: any) {
            Alert.alert("Error", e?.data?.message || "Failed to post review.");
          }
        },
      },
    ]);
  };

  return (
    <View style={s.root}>
      {/* Interaction Area */}
      <View style={s.ratingContainer}>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <View style={{ alignItems: "center" }}>
              <RatingStarInput
                value={field.value!}
                onChange={field.onChange}
                starFilledColor={starFilledColor}
                starHollowedColor={starHollowedColor}
              />
              {errors.rating && (
                <HelperText type="error" padding="none">
                  {errors.rating.message}
                </HelperText>
              )}
            </View>
          )}
        />
      </View>

      <View style={s.fieldContainer}>
        <FormField
          name="comment"
          control={control}
          isEditing={true}
          inputType="paragraph"
          placeholder="Describe your experience (optional)..."
          containerStyle={s.formField}
          inputProps={{
            multiline: true,
            numberOfLines: 4,
          }}
        />
        {errors.comment && (
          <HelperText type="error">{errors.comment.message}</HelperText>
        )}
      </View>

      {/* Action Buttons */}
      <View style={s.actionRow}>
        <Button mode="text" onPress={onCancel} disabled={isLoading}>
          Not now
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          style={s.submitButton}
          contentStyle={s.submitButtonContent}
        >
          Post
        </Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    gap: Spacing.md,
    width: "100%",
    paddingVertical: Spacing.sm,
  },
  ratingContainer: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  fieldContainer: {
    width: "100%",
  },
  formField: {
    minHeight: 120, // Enough for a good comment
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  submitButton: {
    borderRadius: BorderRadius.pill,
  },
  submitButtonContent: {
    paddingHorizontal: Spacing.md,
  },
});
