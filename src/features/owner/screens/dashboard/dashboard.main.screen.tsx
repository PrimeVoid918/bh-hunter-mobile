import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import {
  Text,
  Surface,
  Button,
  Searchbar,
  useTheme,
  Avatar,
  Card,
  Icon,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import PropertyCard from "../../../../components/ui/BoardingHouseItems/PropertyCard";
import VerificationIndicatorComponent from "../../../../components/ui/Verification/VerificationIndicatorComponent";
import { Lists } from "@/components/layout/Lists/Lists";

import { Spacing, BorderRadius, GlobalStyle } from "@/constants";
import { useGetAllQuery as useGetAllQueryBH } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { Owner } from "@/infrastructure/owner/owner.types";
import { OwnerDashboardStackParamList } from "./navigation/dashboard.types";
import DashboardStateCard from "@/components/ui/Dashboard/DashboardStateCard";
import { useGetAllQuery as useGetAllQueryBooking } from "@/infrastructure/booking/booking.redux.api";
import { useGetOverviewMetricsQuery } from "@/infrastructure/metrics/metric.redux.api";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

export default function DashboardMainScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const { selectedUser } = useDynamicUserApi();
  const owner = selectedUser as Owner;

  const {
    data: boardingHouses,
    isLoading,
    isError,
    refetch,
  } = useGetAllQueryBH({ ownerId: owner?.id });

  const { data: metrics } = useGetOverviewMetricsQuery({
    role: "OWNER",
    userId: owner.id,
  });

  const stats = useMemo(() => {
    if (!boardingHouses || !metrics) {
      return { totalProperties: 0, totalRooms: 0, activeBookings: 0 };
    }

    const activeBookings =
      metrics.bookings?.statusCounts
        ?.filter((s) => s.status === "COMPLETED_BOOKING" || s.status === "PAID")
        .reduce((acc, curr) => acc + curr._count.status, 0) ?? 0;

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
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isLoading}
    >
      <View style={[s.container]}>
        {/* 1. Header Section */}
        <View style={s.header}>
          <View>
            <Text variant="displaySmall" style={s.welcomeText}>
              Hi, {owner?.firstname || "Owner"}
            </Text>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Property Portfolio
            </Text>
          </View>
          <Pressable onPress={() => navigate.navigate("Settings" as any)}>
            <Avatar.Icon size={48} icon="account-circle" />
          </Pressable>
        </View>

        {/* 3. Verification - Tonal Surface */}
        <VerificationIndicatorComponent
          onPress={() => navigate.navigate("VerificationMainScreen")}
          isVerified={
            owner?.registrationStatus === "COMPLETED" &&
            owner?.verificationLevel === "FULLY_VERIFIED"
          }
        />

        {/* 4. Stats Row - Elevated Tonal Cards */}
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
            label="Listings"
            value={stats.activeBookings}
            icon="calendar-check"
            bgColor={theme.colors.tertiaryContainer}
            textColor={theme.colors.onTertiaryContainer}
          />
        </View>

        {/* 5. List Header */}
        <View style={s.listHeader}>
          <Text variant="titleLarge" style={{ fontWeight: "700" }}>
            Properties
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigate.navigate("PropertyCreate" as any)}
            style={s.fabReplica}
          >
            Create
          </Button>
        </View>

        <Searchbar
          placeholder="Search properties"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[
            s.searchBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
              borderRadius: BorderRadius.md,
            },
          ]}
          inputStyle={s.searchInput}
          placeholderTextColor={theme.colors.placeholder}
          iconColor={theme.colors.primary}
          mode="bar"
          elevation={0} // Stays flat as per your Design Anchor
        />

        {/* 6. Main List */}
        <View style={{ paddingBottom: 120 }}>
          {boardingHouses?.length === 0 ? (
            <View style={s.emptyState}>
              <Icon
                source="home-off-outline"
                size={64}
                color={theme.colors.outline}
              />
              <Text variant="bodyLarge" style={{ marginTop: 16 }}>
                Start your journey here
              </Text>
            </View>
          ) : (
            <Lists
              list={
                boardingHouses?.filter((bh) =>
                  bh.name.toLowerCase().includes(searchQuery.toLowerCase()),
                ) || []
              }
              contentContainerStyle={{ gap: 16 }}
              renderItem={({ item }) => (
                <PropertyCard data={item}>
                  <Button
                    mode="contained-tonal"
                    icon="cog"
                    onPress={() =>
                      navigate.navigate("BoardingHouseDetailsScreen", {
                        id: item.id,
                      })
                    }
                    style={{ marginTop: 8 }}
                  >
                    Manage
                  </Button>
                </PropertyCard>
              )}
            />
          )}
        </View>
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontWeight: "900",
    letterSpacing: -1,
  },
  verifSurface: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
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
  fabReplica: {
    borderRadius: BorderRadius.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    opacity: 0.5,
  },

  searchBar: {
    height: 52,
    borderWidth: 1,
    borderColor: "transparent", // Default state
  },
  searchInput: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    minHeight: 0,
  },
});
