import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  CreateReviewInput,
  CreateReviewSchema,
} from "@/infrastructure/reviews/reviews.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMutation } from "@/infrastructure/reviews/reviews.redux.api";
import { FormField } from "../FormFields/FormField";
import { Button, ButtonText, HStack, VStack } from "@gluestack-ui/themed";
import StarRatingInput from "./StarRatingInput";
import { Alert, Text } from "react-native";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import FormStateActionsButton from "../Buttons/FormStateActionsButton";
import { BorderRadius, Colors, Spacing } from "@/constants";
import RatingStarInput from "../Ratings/RatingStarInput";

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
      rating: 1,
      comment: "",
    },
  });

  const [createReview, { isLoading }] = useCreateMutation();

  const onSubmit = (data: CreateReviewInput) => {
    Alert.alert(
      "Submit Review?",
      "Are you sure you want to post this review?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Post it",
          onPress: async () => {
            try {
              await createReview({ boardingHouseId, data }).unwrap();

              Alert.alert("Success", "Your review has been posted!", [
                {
                  text: "OK",
                  onPress: () => {
                    reset();
                    onSubmitSuccess();
                  },
                },
              ]);
            } catch (e: any) {
              const errorMessage = e?.data?.message || "Something went wrong.";
              Alert.alert("Submission Failed", errorMessage, [
                { text: "Try Again" },
              ]);
            }
          },
        },
      ],
    );
  };

  return (
    <VStack style={{ gap: Spacing.sm }}>
      <VStack
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: Spacing.md,
        }}
      >
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
            borderColor: Colors.PrimaryLight[8],
            borderRadius: BorderRadius.md,
          }}
        />
      </VStack>

      {/* local actions */}
      <HStack style={{ gap: Spacing.md, marginLeft: "auto" }}>
        <FormStateActionsButton
          label={isLoading ? "Submitting..." : "Submit"}
          variant="primary"
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
        />
        {/* <FormStateActionsButton
          label="Cancel"
          variant="danger"
          onPress={() => {
            reset();
            onCancel();
          }}
        /> */}
      </HStack>
    </VStack>
  );
}
