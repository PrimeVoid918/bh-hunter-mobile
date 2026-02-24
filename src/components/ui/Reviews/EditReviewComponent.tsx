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
import { HStack, VStack } from "@gluestack-ui/themed";

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
  const { colors } = useTheme();
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
    <VStack style={s.root}>
      {/* 1. Rating Selector Card */}
      <Surface style={s.inputSurface} elevation={0}>
        <VStack alignItems="center" gap={Spacing.xs}>
          <Text
            variant="labelMedium"
            style={[s.label, { color: colors.primary }]}
          >
            YOUR RATING
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
            <HelperText type="error" padding="none">
              {errors.rating.message}
            </HelperText>
          )}
        </VStack>
      </Surface>

      {/* 2. Comment Field Area */}
      <VStack gap={4}>
        <Text variant="labelMedium" style={s.fieldLabel}>
          Edit your feedback
        </Text>
        <FormField
          name="comment"
          control={control}
          isEditing={true}
          inputType="paragraph"
          placeholder="What changed? What did you like or dislike?"
          inputProps={{
            multiline: true,
            numberOfLines: 5,
          }}
        />
        {errors.comment && (
          <HelperText type="error">{errors.comment.message}</HelperText>
        )}
      </VStack>

      {/* 3. Actions Row */}
      <HStack style={s.actions}>
        <Button
          mode="text"
          onPress={onCancel}
          disabled={isLoading}
          labelStyle={s.compactLabel}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          icon="check-circle-outline"
          style={s.submitButton}
          contentStyle={s.submitButtonContent}
          labelStyle={s.compactLabel}
        >
          Update
        </Button>
      </HStack>
    </VStack>
  );
}

const s = StyleSheet.create({
  root: {
    gap: Spacing.md,
    width: "100%",
  },
  inputSurface: {
    padding: Spacing.md,
    backgroundColor: "#F0F0F5", // surfaceVariant
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#CCCCCC", // outlineVariant
    borderStyle: "dashed",
  },
  label: {
    fontFamily: "Poppins-Bold",
    letterSpacing: 1,
    opacity: 0.8,
  },
  fieldLabel: {
    fontFamily: "Poppins-Medium",
    color: "#767474", // outline
    marginLeft: 4,
  },
  actions: {
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  submitButton: {
    borderRadius: BorderRadius.md, // MD3 standard radius
    minWidth: 100,
  },
  submitButtonContent: {
    height: 40,
    paddingHorizontal: 8,
    flexDirection: "row-reverse",
  },
  compactLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
});
