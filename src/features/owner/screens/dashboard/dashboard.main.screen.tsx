import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, Button, useTheme, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import PropertyCard from "../../../../components/ui/BoardingHouseItems/PropertyCard";
import VerificationIndicatorComponent from "../../../../components/ui/Verification/VerificationIndicatorComponent";
import { Spacing, BorderRadius } from "@/constants";
import { useGetAllQuery as useGetAllQueryBH } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { OwnerDashboardStackParamList } from "./navigation/dashboard.types";
import DashboardStateCard from "@/components/ui/Dashboard/DashboardStateCard";
import { useGetOverviewMetricsQuery } from "@/infrastructure/metrics/metric.redux.api";
import PaginatedSearchList from "@/components/layout/PaginatedSearchList/PaginatedSearchList";
import { QueryBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import { navigationRef } from "../../../../application/navigation/navigationRef";

export default function DashboardMainScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const { selectedUser } = useDynamicUserApi();
  const owner = selectedUser;

  const {
    data: boardingHouses,
    isLoading,
    refetch,
  } = useGetAllQueryBH(
    { ownerId: owner?.id, isDeleted: false },
    { skip: !owner?.id, refetchOnMountOrArgChange: true },
  );

  const { data: metrics } = useGetOverviewMetricsQuery({
    role: "OWNER",
    userId: owner?.id,
  });

  const triggerHaptic = () => ReactNativeHapticFeedback.trigger("impactLight");

  const stats = useMemo(() => {
    if (!boardingHouses || !metrics) {
      return { totalProperties: 0, totalRooms: 0, activeBookings: 0 };
    }
    const activeBookings =
      metrics.bookings?.statusCounts
        ?.filter(
          (s: any) => s.status === "COMPLETED_BOOKING" || s.status === "PAID",
        )
        .reduce((acc: number, curr: any) => acc + curr._count.status, 0) ?? 0;

    return {
      totalProperties: boardingHouses.length,
      totalRooms: boardingHouses.reduce(
        (acc, bh) => acc + (bh.rooms?.length || 0),
        0,
      ),
      activeBookings,
    };
  }, [boardingHouses, metrics]);

  const handlePageRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <StaticScreenWrapper
      variant="list"
      style={{ backgroundColor: theme.colors.background }}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isLoading}
    >
      <View style={s.mainContainer}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text variant="displaySmall" style={s.welcomeText}>
              Hi, {owner?.firstname || "Owner"}
            </Text>
            <Text variant="bodyMedium" style={s.subtitle}>
              Property Portfolio
            </Text>
          </View>
          <Pressable
            onPress={() => {
              triggerHaptic();
              navigate.navigate("Settings" as any);
            }}
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
          </Pressable>
        </View>

        {/* 2. VERIFICATION (Contained Component) */}
        <View style={s.sectionSpacing}>
          <VerificationIndicatorComponent
            onPress={() => {
              triggerHaptic();
              navigate.navigate("VerificationMainScreen");
            }}
            isVerified={
              owner?.registrationStatus === "COMPLETED" &&
              owner?.verificationLevel === "FULLY_VERIFIED"
            }
          />
        </View>

        {/* 3. STATS ROW (Dashboard Identity) */}
        <View style={s.statsRow}>
          <DashboardStateCard
            label="Properties"
            value={stats.totalProperties}
            icon="home-variant"
            bgColor={theme.colors.primaryContainer}
            textColor={theme.colors.onPrimaryContainer}
          />
          <DashboardStateCard
            label="Rooms"
            value={stats.totalRooms}
            icon="bed"
            bgColor={theme.colors.secondaryContainer}
            textColor={theme.colors.onSecondaryContainer}
          />
          <DashboardStateCard
            label="Active"
            value={stats.activeBookings}
            icon="calendar-check"
            bgColor={theme.colors.surfaceVariant}
            textColor={theme.colors.onSurfaceVariant}
          />
        </View>

        {/* 4. LIST HEADER ACTIONS */}
        <View style={s.listHeader}>
          <Text variant="titleLarge" style={s.sectionTitle}>
            Your Properties
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => {
              triggerHaptic();
              navigationRef.navigate("Properties" as any, {
                screen: "PropertyCreate",
              });
            }}
            style={s.fabReplica}
            labelStyle={s.buttonLabel}
          >
            Create
          </Button>
        </View>

        {/* 5. SEARCH & LIST */}
        <PaginatedSearchList<QueryBoardingHouse>
          ownerId={owner?.id}
          useApi={useGetAllQueryBH}
          apiParams={{ minPrice: 1500 }}
          searchKey="name"
          renderItem={({ item }) => (
            <PropertyCard data={item}>
              <Button
                mode="contained-tonal"
                icon="cog"
                onPress={() => {
                  triggerHaptic();
                  navigate.navigate("BoardingHouseDetailsScreen", {
                    id: item.id,
                  });
                }}
                style={s.manageBtn}
                labelStyle={s.manageLabel}
              >
                Manage Property
              </Button>
            </PropertyCard>
          )}
          searchPlaceholder="Search properties"
          renderEmpty={() => (
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>No boarding houses found</Text>
            </View>
          )}
        />
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainContainer: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  welcomeText: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    color: "#767474",
    marginTop: -4,
  },
  sectionSpacing: {
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  fabReplica: {
    borderRadius: BorderRadius.md,
  },
  buttonLabel: {
    fontFamily: "Poppins-SemiBold",
  },
  manageBtn: {
    marginTop: 8,
    borderRadius: BorderRadius.md,
  },
  manageLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: Spacing.lg,
  },
  emptyText: {
    fontFamily: "Poppins-Regular",
    color: "#CCCCCC",
  },
});
