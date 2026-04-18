import React from "react";
import { StyleSheet, Alert } from "react-native";
import {
  Text,
  Button,
  useTheme,
  Surface,
  Divider,
  Icon,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Spacing, BorderRadius } from "@/constants";
import { Review } from "@/infrastructure/reviews/reviews.schema";
import { ReviewInputMode } from "./types";
import { CreateReviewComponent } from "./CraeteReviewComponent";
import EditReviewComponent from "./EditReviewComponent";
import ReviewItem from "./ReviewItem";
import { useDeleteMutation } from "@/infrastructure/reviews/reviews.redux.api";
import { VStack, HStack, Box } from "@gluestack-ui/themed";
import { useGetTenantAccessQuery } from "@/infrastructure/access/access.redux.api";
import { RootState } from "@/application/store/stores";
import { useSelector } from "react-redux";
import { isTenantAccess } from "@/infrastructure/access/access.schema";

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

  const tenantId = useSelector(
    (state: RootState) => state.tenants.selectedUser?.id,
  );

  const { data: access, isLoading: isAccessLoading } = useGetTenantAccessQuery(
    { id: tenantId! },
    { skip: !tenantId, refetchOnMountOrArgChange: true },
  );

  React.useEffect(() => {
    setMode(myReview ? "viewing" : "creating");
  }, [myReview]);

  if (isAccessLoading || !access) return <></>;
  const isLocked = isTenantAccess(access) ? !access.canMakeReview : false;

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
    );
  };

  if (isLocked && mode !== "viewing") {
    return (
      <Surface elevation={0} style={s.lockdownCard}>
        <HStack space="md" alignItems="center">
          <Box style={s.lockIconBg}>
            <Icon
              source="comment-off-outline"
              size={22}
              color={colors.outline}
            />
          </Box>
          <VStack style={{ flex: 1 }}>
            <Text style={s.lockTitle}>Reviews Restricted</Text>
            <Text style={s.lockSub}>
              You must be Fully Verified to leave or edit reviews. Please
              complete your identity verification in your profile.
            </Text>
          </VStack>
        </HStack>
      </Surface>
    );
  }

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
  root: { marginVertical: Spacing.sm },
  boldPoppins: { fontFamily: "Poppins-SemiBold" },
  createCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
  },
  editCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: "#357FC1",
    backgroundColor: "#FFFFFF",
  },
  viewCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#F7F9FC",
  },
  cardHeader: { marginBottom: Spacing.xs },
  actionLabel: { fontSize: 12, fontFamily: "Poppins-Medium" },
  lockdownCard: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#F0F0F5",
    borderStyle: "dashed",
    marginVertical: Spacing.sm,
  },
  lockIconBg: {
    padding: 8,
    backgroundColor: "#E0E0E5",
    borderRadius: 8,
  },
  lockTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#4A4A4A",
  },
  lockSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
    lineHeight: 16,
  },
});
