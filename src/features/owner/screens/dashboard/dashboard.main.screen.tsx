import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Divider,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import VerificationIndicatorComponent from "../../../../components/ui/Verification/VerificationIndicatorComponent";
import { Spacing, BorderRadius } from "@/constants";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { OwnerDashboardStackParamList } from "./navigation/dashboard.types";
import { useGetOverviewMetricsQuery } from "@/infrastructure/metrics/metric.redux.api";
import { isOwnerAccess } from "@/infrastructure/access/access.schema";
import { useGetOwnerAccessQuery } from "@/infrastructure/access/access.redux.api";
import SubscriptionSectionComponent from "./components/SubscriptionSectionComponent";
import { navigationRef } from "../../../../application/navigation/navigationRef";
import MetricCard from "./components/MetricCard";
import QuickActionCard from "./components/QuickActionCard";
import { useGetOwnerActiveSubscriptionQuery } from "@/infrastructure/subscriptions/subscriptions.redux.api";

export default function DashboardMainScreen() {
  const theme = useTheme();
  const { selectedUser } = useDynamicUserApi();
  const owner = selectedUser;

  const [refreshing, setRefreshing] = useState(false);

  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const {
    data: access,
    isLoading: isAccessLoading,
    refetch: refetchAccessData,
  } = useGetOwnerAccessQuery(
    { id: owner?.id! },
    { skip: !owner?.id, refetchOnMountOrArgChange: true },
  );

  const {
    data: activeSubscriptionData,
    isLoading: isActiveSubscriptionDataLoading,
    refetch: refetchActiveSubscription,
  } = useGetOwnerActiveSubscriptionQuery(
    { id: owner?.id! },
    { skip: !owner?.id, refetchOnMountOrArgChange: true },
  );

  const {
    data: metrics,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useGetOverviewMetricsQuery(
    owner?.id
      ? {
          role: "OWNER",
          userId: owner.id,
        }
      : undefined,
    {
      skip: !owner?.id,
      refetchOnMountOrArgChange: true,
    },
  );

  const triggerHaptic = () => ReactNativeHapticFeedback.trigger("impactLight");

  const getBookingCount = (status: string) =>
    metrics?.bookings?.statusCounts?.find((s) => s.status === status)?._count
      ?.status ?? 0;

  const dashboard = useMemo(() => {
    const isVerified =
      access && isOwnerAccess(access) ? access.isVerified : false;

    const pendingRequests = getBookingCount("PENDING_REQUEST");
    const awaitingPayment = getBookingCount("AWAITING_PAYMENT");
    const confirmed = getBookingCount("COMPLETED_BOOKING");
    const cancelled =
      getBookingCount("CANCELLED_BOOKING") +
      getBookingCount("REJECTED_BOOKING");

    const hasActiveSubscription = (metrics?.subscriptions?.active ?? 0) > 0;

    const attentionItems: string[] = [];

    if (!isVerified) {
      attentionItems.push(
        "Complete owner verification to unlock full platform access.",
      );
    }

    if (!hasActiveSubscription) {
      attentionItems.push(
        "No active subscription. Listing visibility may be limited.",
      );
    }

    if (pendingRequests > 0) {
      attentionItems.push(
        `${pendingRequests} booking request${pendingRequests > 1 ? "s" : ""} waiting for review.`,
      );
    }

    if (awaitingPayment > 0) {
      attentionItems.push(
        `${awaitingPayment} booking${awaitingPayment > 1 ? "s are" : " is"} awaiting payment.`,
      );
    }

    return {
      isVerified,
      hasActiveSubscription,
      pendingRequests,
      awaitingPayment,
      confirmed,
      cancelled,
      totalProperties: metrics?.properties?.totalHouses ?? 0,
      totalRooms: metrics?.properties?.totalRooms ?? 0,
      totalBookings: metrics?.bookings?.totalBookings ?? 0,
      grossPaidBookingTotal: metrics?.payments?.revenue ?? 0,
      averageRating: metrics?.reviews?.averageRating ?? 0,
      activeSubscriptions: metrics?.subscriptions?.active ?? 0,
      attentionItems,
    };
  }, [access, metrics]);

  const handlePageRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchAccessData(),
      refetchMetrics(),
      refetchActiveSubscription(),
    ]);
    setRefreshing(false);
  };

  const handleReviewNow = () => {
    triggerHaptic();

    if (!dashboard.isVerified) {
      navigate.navigate("VerificationMainScreen");
      return;
    }

    if (dashboard.pendingRequests > 0 || dashboard.awaitingPayment > 0) {
      navigationRef.navigate("Booking" as never);
      return;
    }

    if (!dashboard.hasActiveSubscription) {
      // Plug your subscription stack/screen here if you want a direct CTA later.
      navigate.navigate("Settings" as never);
      return;
    }

    navigationRef.navigate("Properties" as never);
  };

  const formatCurrency = (value: number) => {
    return `₱ ${Number(value || 0).toLocaleString()}`;
  };

  if ((isAccessLoading || isMetricsLoading) && !metrics) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <StaticScreenWrapper
      variant="list"
      style={{ backgroundColor: theme.colors.background }}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={
        isAccessLoading || isMetricsLoading || isActiveSubscriptionDataLoading
      }
    >
      <View style={s.mainContainer}>
        <HStack
          justifyContent="space-between"
          alignItems="center"
          style={s.header}
        >
          <VStack flex={1}>
            <Text
              variant="displaySmall"
              style={[s.welcomeText, { color: theme.colors.onSurface }]}
            >
              Hi, {owner?.firstname || "Owner"}
            </Text>
            <Text
              variant="bodyMedium"
              style={[s.subtitle, { color: theme.colors.outline }]}
            >
              Property Portfolio Overview
            </Text>
          </VStack>

          <TouchableRipple
            borderless={true}
            onPress={() => {
              triggerHaptic();
              navigate.navigate("Settings" as never);
            }}
            style={s.avatarPress}
          >
            <Avatar.Text
              size={48}
              label={owner?.firstname?.[0] || "O"}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              labelStyle={{
                color: theme.colors.onPrimaryContainer,
                fontFamily: "Poppins-Medium",
              }}
            />
          </TouchableRipple>
        </HStack>

        <Surface
          elevation={0}
          style={[
            s.attentionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <VStack gap={Spacing.md}>
            <HStack alignItems="center" justifyContent="space-between">
              <HStack alignItems="center" gap={Spacing.sm}>
                <Box
                  style={[
                    s.attentionIconWrap,
                    {
                      backgroundColor:
                        dashboard.attentionItems.length > 0
                          ? theme.colors.secondary
                          : theme.colors.primaryContainer,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      dashboard.attentionItems.length > 0
                        ? "alert-outline"
                        : "check-circle-outline"
                    }
                    size={20}
                    color={
                      dashboard.attentionItems.length > 0
                        ? theme.colors.onSecondary
                        : theme.colors.primary
                    }
                  />
                </Box>

                <VStack>
                  <Text
                    variant="titleMedium"
                    style={[s.sectionTitle, { color: theme.colors.onSurface }]}
                  >
                    {dashboard.attentionItems.length > 0
                      ? "Needs Attention"
                      : "You're All Set"}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      s.sectionDescription,
                      { color: theme.colors.outline },
                    ]}
                  >
                    {dashboard.attentionItems.length > 0
                      ? "Prioritize these items to keep operations moving."
                      : "Your account and portfolio have no urgent issues right now."}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {dashboard.attentionItems.length > 0 && (
              <VStack gap={Spacing.sm}>
                {dashboard.attentionItems.map((item, index) => (
                  <HStack key={index} alignItems="flex-start" gap={Spacing.sm}>
                    <MaterialCommunityIcons
                      name="circle-medium"
                      size={18}
                      color={theme.colors.primary}
                      style={{ marginTop: -2 }}
                    />
                    <Text
                      variant="bodySmall"
                      style={[
                        s.attentionText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {item}
                    </Text>
                  </HStack>
                ))}
                {dashboard.attentionItems.length > 0 && (
                  <TouchableRipple
                    borderless={false}
                    onPress={handleReviewNow}
                    style={[
                      s.reviewNowChip,
                      { backgroundColor: theme.colors.primaryContainer },
                    ]}
                  >
                    <Text
                      style={[s.reviewNowText, { color: theme.colors.primary }]}
                    >
                      Review Now
                    </Text>
                  </TouchableRipple>
                )}
              </VStack>
            )}
          </VStack>
        </Surface>

        <View style={s.sectionSpacing}>
          <VerificationIndicatorComponent
            onPress={() => {
              triggerHaptic();
              navigate.navigate("VerificationMainScreen");
            }}
            isVerified={dashboard.isVerified}
          />
        </View>

        <HStack style={s.metricGrid}>
          <MetricCard
            label="Properties"
            value={dashboard.totalProperties}
            icon="home-city-outline"
            bgColor={theme.colors.primaryContainer}
            iconColor={theme.colors.primary}
          />
          <MetricCard
            label="Rooms"
            value={dashboard.totalRooms}
            icon="door-open"
            bgColor={theme.colors.secondary}
            iconColor={theme.colors.onSecondary}
          />
        </HStack>

        <HStack style={s.metricGrid}>
          <MetricCard
            label="Bookings"
            value={dashboard.totalBookings}
            icon="calendar-check-outline"
            bgColor={theme.colors.surfaceVariant}
            iconColor={theme.colors.onSurface}
          />
          <MetricCard
            label="Paid Booking Total"
            value={formatCurrency(dashboard.grossPaidBookingTotal)}
            icon="cash-multiple"
            bgColor="#DFF4E7"
            iconColor="#1E7A46"
          />
        </HStack>

        <Surface
          elevation={0}
          style={[
            s.snapshotCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <VStack gap={Spacing.md}>
            <VStack>
              <Text
                variant="titleLarge"
                style={[s.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Booking Snapshot
              </Text>
              <Text
                variant="bodySmall"
                style={[s.sectionDescription, { color: theme.colors.outline }]}
              >
                A quick view of booking activity across your portfolio.
              </Text>
            </VStack>

            <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

            <VStack gap={Spacing.sm}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  style={[s.snapshotLabel, { color: theme.colors.onSurface }]}
                >
                  Pending Requests
                </Text>
                <Text
                  style={[s.snapshotValue, { color: theme.colors.onSurface }]}
                >
                  {dashboard.pendingRequests}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  style={[s.snapshotLabel, { color: theme.colors.onSurface }]}
                >
                  Awaiting Payment
                </Text>
                <Text
                  style={[s.snapshotValue, { color: theme.colors.onSurface }]}
                >
                  {dashboard.awaitingPayment}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  style={[s.snapshotLabel, { color: theme.colors.onSurface }]}
                >
                  Confirmed
                </Text>
                <Text
                  style={[s.snapshotValue, { color: theme.colors.onSurface }]}
                >
                  {dashboard.confirmed}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  style={[s.snapshotLabel, { color: theme.colors.onSurface }]}
                >
                  Cancelled / Rejected
                </Text>
                <Text
                  style={[s.snapshotValue, { color: theme.colors.onSurface }]}
                >
                  {dashboard.cancelled}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Surface>

        <View style={s.sectionSpacing}>
          <SubscriptionSectionComponent data={activeSubscriptionData} />
        </View>

        <VStack gap={Spacing.md}>
          <VStack>
            <Text
              variant="titleLarge"
              style={[s.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Quick Actions
            </Text>
            <Text
              variant="bodySmall"
              style={[s.sectionDescription, { color: theme.colors.outline }]}
            >
              Jump directly into the owner workflows you use most.
            </Text>
          </VStack>

          <QuickActionCard
            icon="home-city-outline"
            title="Manage Properties"
            subtitle="Open your property and room listings."
            onPress={() => {
              triggerHaptic();
              navigationRef.navigate("Properties" as never);
            }}
          />

          <QuickActionCard
            icon="calendar-check-outline"
            title="View Bookings"
            subtitle="Check requests, payments, and booking statuses."
            onPress={() => {
              triggerHaptic();
              navigationRef.navigate("Booking" as never);
            }}
          />

          <QuickActionCard
            icon="shield-check-outline"
            title="Verification"
            subtitle="Complete or review your owner verification."
            onPress={() => {
              triggerHaptic();
              navigate.navigate("VerificationMainScreen");
            }}
          />

          {/* <QuickActionCard
            icon="cog-outline"
            title="Settings"
            subtitle="Update your preferences and account options."
            onPress={() => {
              triggerHaptic();
              navigate.navigate("Settings" as never);
            }}
          /> */}
        </VStack>
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainContainer: {
    gap: Spacing.md,
    paddingBottom: 40,
  },

  header: {
    marginTop: 8,
  },
  avatarPress: {
    borderRadius: 999,
    overflow: "hidden",
  },
  welcomeText: {
    fontFamily: "Poppins-Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    marginTop: -4,
  },

  attentionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    overflow: "hidden",
  },
  attentionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  attentionText: {
    fontFamily: "Poppins-Regular",
    flex: 1,
    lineHeight: 20,
  },
  reviewNowChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden",
  },
  reviewNowText: {
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },

  sectionSpacing: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
  },
  sectionDescription: {
    fontFamily: "Poppins-Regular",
    marginTop: 2,
    lineHeight: 19,
  },

  snapshotCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
  },
  snapshotLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  snapshotValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 15,
  },

  metricGrid: {
    gap: Spacing.md,
  },
});
