import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Button,
  HelperText,
  useTheme,
  Surface,
} from "react-native-paper";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { VStack, HStack } from "@gluestack-ui/themed";

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
  const { colors } = useTheme();
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
      rating: 0,
      comment: "",
    },
  });

  const [createReview, { isLoading }] = useCreateMutation();

  const onSubmit = (data: CreateReviewInput) => {
    if (data.rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please select a star rating to help others.",
      );
      return;
    }

    // High-Trust Feedback: Standard M3 Alert
    Alert.alert("Post Review?", "Your feedback will be visible to everyone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Post Now",
        onPress: async () => {
          try {
            await createReview({ boardingHouseId, data }).unwrap();
            reset();
            onSubmitSuccess();
          } catch (e: any) {
            Alert.alert(
              "Post Failed",
              e?.data?.message || "Something went wrong.",
            );
          }
        },
      },
    ]);
  };

  return (
    <VStack style={s.root}>
      {/* 1. Star Selection Area */}
      <Surface style={s.ratingSurface} elevation={0}>
        <Text variant="labelMedium" style={s.label}>
          TAP TO RATE
        </Text>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <VStack alignItems="center">
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
            </VStack>
          )}
        />
      </Surface>

      {/* 2. Comment Field */}
      <VStack style={s.fieldWrapper}>
        <FormField
          name="comment"
          control={control}
          isEditing={true}
          inputType="paragraph"
          placeholder="What was it like living here? Describe the host, the rooms, or the location..."
          inputProps={{
            multiline: true,
            numberOfLines: 5,
          }}
        />
        {errors.comment && (
          <HelperText type="error">{errors.comment.message}</HelperText>
        )}
      </VStack>

      {/* 3. Actions */}
      <HStack style={s.actionRow}>
        {/* <Button
          mode="text"
          onPress={onCancel}
          disabled={isLoading}
          textColor={colors.outline}
        >
          Not now
        </Button> */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          // icon="send-variant"
          style={s.submitButtonCompact}
          contentStyle={s.submitButtonContentCompact}
          labelStyle={s.submitLabel}
        >
          Post Review?
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
  ratingSurface: {
    paddingVertical: Spacing.md,
    alignItems: "center",
    backgroundColor: "#F0F0F5", // surfaceVariant
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderStyle: "dashed", // Visual cue that this is an interactive input area
  },
  label: {
    marginBottom: Spacing.xs,
    letterSpacing: 1,
    opacity: 0.6,
  },
  fieldWrapper: {
    width: "100%",
  },
  actionRow: {
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  submitButton: {
    borderRadius: BorderRadius.md,
    margin: 0,
  },
  submitButtonContent: {
    flexDirection: "row-reverse", // Icon on the right for M3 feel
    paddingHorizontal: Spacing.sm,
    height: 48,
    padding: 0,
  },

  submitButtonCompact: {
    borderRadius: BorderRadius.md,
    // minWidth: 150, // Explicitly smaller minWidth
    alignSelf: "flex-end", // Prevents the button from stretching to parent width
  },
  submitButtonContentCompact: {
    height: 40, // M3 standard height for compact buttons is 40dp
    paddingHorizontal: 4, // Tighten the internal horizontal padding
    flexDirection: "row-reverse", // Keeps the icon on the right
  },
  submitLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    // marginHorizontal: 8, // Controls distance between text and icon
  },
});
