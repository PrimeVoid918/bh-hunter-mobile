import React from "react";
import { StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Button,
  Divider,
  Icon,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import { Spacing } from "@/constants";
import { useGetAgreementReviewInfoQuery } from "@/infrastructure/agreements/agreements.redux.api";
import AgreementWebViewModal from "@/components/ui/WebViews/AgreementWebViewModal";

type Role = "TENANT" | "OWNER";

type Props = {
  bookingId: number;
  viewerRole: Role;
};

export default function BookingAgreementBlock({
  bookingId,
  viewerRole,
}: Props) {
  const theme = useTheme();
  const [showAgreement, setShowAgreement] = React.useState(false);

  const {
    data: reviewInfo,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAgreementReviewInfoQuery(bookingId, {
    skip: !bookingId,
    refetchOnMountOrArgChange: true,
  });

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  if (isLoading) {
    return (
      <Surface
        elevation={0}
        style={[s.card, { borderColor: theme.colors.outlineVariant }]}
      >
        <HStack space="sm" alignItems="center">
          <ActivityIndicator size="small" />
          <Text style={s.loadingText}>Loading digital agreement...</Text>
        </HStack>
      </Surface>
    );
  }

  if (isError || !reviewInfo) {
    return (
      <Surface
        elevation={0}
        style={[s.card, { borderColor: theme.colors.outlineVariant }]}
      >
        <VStack space="sm">
          <HStack space="sm" alignItems="center">
            <Icon
              source="file-document-alert-outline"
              size={20}
              color={theme.colors.outline}
            />
            <Text style={s.title}>Digital Agreement</Text>
          </HStack>

          <Text style={s.bodyText}>
            No saved digital agreement was found for this booking.
          </Text>

          <Button
            mode="outlined"
            compact
            onPress={() => {
              triggerHaptic();
              refetch();
            }}
          >
            Retry
          </Button>
        </VStack>
      </Surface>
    );
  }

  const acceptedAt = reviewInfo.tenantAcceptedAt
    ? new Date(reviewInfo.tenantAcceptedAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not recorded";

  const roleMessage =
    viewerRole === "TENANT"
      ? "This is the agreement snapshot you accepted when submitting the booking request."
      : "This is the tenant’s saved agreement snapshot from the booking request.";

  return (
    <>
      <Surface
        elevation={0}
        style={[s.card, { borderColor: theme.colors.outlineVariant }]}
      >
        <VStack space="md">
          <HStack alignItems="center" justifyContent="space-between">
            <HStack space="sm" alignItems="center" flex={1}>
              <Box
                style={[
                  s.iconCircle,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <Icon
                  source="file-document-check-outline"
                  size={22}
                  color={theme.colors.primary}
                />
              </Box>

              <VStack flex={1}>
                <Text style={s.eyebrow}>DIGITAL AGREEMENT</Text>
                <Text style={s.title}>Saved Booking Agreement</Text>
              </VStack>
            </HStack>

            {isFetching && <ActivityIndicator size="small" />}
          </HStack>

          <Text style={s.bodyText}>{roleMessage}</Text>

          <Surface
            elevation={0}
            style={[s.summaryBox, { borderColor: theme.colors.outlineVariant }]}
          >
            <VStack space="xs">
              <HStack justifyContent="space-between">
                <Text style={s.metaLabel}>Status</Text>
                <Text style={s.statusValue}>{reviewInfo.agreementStatus}</Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text style={s.metaLabel}>Accepted</Text>
                <Text style={s.metaValue}>{acceptedAt}</Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text style={s.metaLabel}>Accepted Version</Text>
                <Text style={s.metaValue}>
                  {reviewInfo.acceptedTermsVersion}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text style={s.metaLabel}>Current Version</Text>
                <Text style={s.metaValue}>
                  {reviewInfo.currentTermsVersion}
                </Text>
              </HStack>
            </VStack>
          </Surface>

          {reviewInfo.hasNewRules && (
            <Surface
              elevation={0}
              style={[
                s.warningBox,
                {
                  borderColor: "#FDD85D",
                  backgroundColor: "#FDD85D1A",
                },
              ]}
            >
              <HStack space="sm" alignItems="flex-start">
                <Icon source="alert-circle-outline" size={20} color="#8A6500" />

                <VStack flex={1} space="xs">
                  <Text style={s.warningTitle}>New Rules Posted</Text>
                  <Text style={s.warningText}>{reviewInfo.message}</Text>
                </VStack>
              </HStack>
            </Surface>
          )}

          <Divider style={s.hairline} />

          <HStack space="sm" justifyContent="flex-end">
            <Button
              mode="outlined"
              compact
              onPress={() => {
                triggerHaptic();
                refetch();
              }}
            >
              Refresh
            </Button>

            <Button
              mode="contained"
              compact
              onPress={() => {
                triggerHaptic();
                setShowAgreement(true);
              }}
            >
              View Agreement
            </Button>
          </HStack>
        </VStack>
      </Surface>

      <AgreementWebViewModal
        visible={showAgreement}
        bookingId={bookingId}
        onClose={() => setShowAgreement(false)}
      />
    </>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    padding: Spacing.md,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  eyebrow: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
    color: "#357FC1",
    letterSpacing: 1,
  },

  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#1A1A1A",
  },

  bodyText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
    lineHeight: 18,
  },

  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
  },

  summaryBox: {
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#F7F9FC",
    padding: Spacing.md,
  },

  metaLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
  },

  metaValue: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#1A1A1A",
    textAlign: "right",
    maxWidth: "58%",
  },

  statusValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    color: "#357FC1",
  },

  warningBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
  },

  warningTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#8A6500",
  },

  warningText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#5F4B00",
    lineHeight: 17,
  },

  hairline: {
    height: 1,
    backgroundColor: "#F0F0F5",
  },
});
