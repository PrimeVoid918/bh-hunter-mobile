import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import {
  Text,
  Surface,
  useTheme,
  Divider,
  ActivityIndicator,
  TouchableRipple,
} from "react-native-paper";
import { VStack, HStack, Box, Image } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import HeroComponent from "../components/HeroComponent";
import VerificationIndicatorComponent from "@/components/ui/Verification/VerificationIndicatorComponent";

import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import {
  useGetActiveQuery,
  useGetAllQuery,
} from "@/infrastructure/booking/booking.redux.api";
import { useGetAllQuery as useGetAllMarkersQuery } from "@/infrastructure/map/map.redux.api";
import { getBookingStatusDetails } from "@/infrastructure/booking/booking.schema";
import { Spacing, Colors, Fontsize } from "@/constants";
import { useGetTenantAccessQuery } from "@/infrastructure/access/access.redux.api";
import { isTenantAccess } from "@/infrastructure/access/access.schema";
import { TenantDashboardStackParamList } from "../navigation/dashboard.stack";
import { DEFAULT_COORDS } from "@/application/config/map.config";

export default function MainScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const { selectedUser: user } = useDynamicUserApi();
  const navigation =
    useNavigation<NativeStackNavigationProp<TenantDashboardStackParamList>>();

  // API - Fetch Active Stay
  const {
    data: activeStay,
    isLoading: isActiveLoading,
    refetch: refetchActiveStay,
  } = useGetActiveQuery(user?.id, { skip: !user?.id });

  // API - Fetch Pending Requests (to count them)
  const {
    data: allBookings,
    refetch: refetchAllBookingData,
    isLoading: isAllBookingsLoading,
  } = useGetAllQuery(
    { tenantId: user?.id, status: "PENDING_REQUEST" },
    { skip: !user?.id },
  );

  const {
    data: access,
    isLoading: isAccessLoading,
    refetch: refetchAccessData,
  } = useGetTenantAccessQuery(
    { id: user?.id! },
    { skip: !user?.id, refetchOnMountOrArgChange: true },
  );

  const {
    data: markers = [],
    isLoading: isAllMarkersLoading,
    isError,
    refetch: refetchAllMarkers,
    isFetching,
  } = useGetAllMarkersQuery({
    lat: DEFAULT_COORDS.lat,
    lng: DEFAULT_COORDS.lng,
    radius: 5000,
  });

  const pendingCount = allBookings?.length || 0;

  const handlePageRefresh = async () => {
    setRefreshing(true);
    await refetchAllBookingData();
    await refetchAccessData();
    await refetchActiveStay();
    await refetchAllMarkers();
    setRefreshing(false);
  };

  if (isAccessLoading || !access)
    return <ActivityIndicator style={{ flex: 1 }} />;
  const lockdown = isTenantAccess(access) ? access.isVerified : false;

  return (
    <StaticScreenWrapper
      variant="list"
      style={s.root}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isActiveLoading || isAccessLoading || isAllMarkersLoading}
    >
      <VStack space="lg" pb={Spacing.xl}>
        <VStack>
          <HeroComponent />
          <Text style={s.greeting}>Welcome!, {user?.firstname}!</Text>
          <Text style={s.subGreeting}>Manage your stay in Ormoc City.</Text>
        </VStack>

        <VerificationIndicatorComponent
          onPress={() => navigation.navigate("VerificationMainScreen")}
          isVerified={lockdown}
        />

        {/* 3. CONDITIONAL BOOKING SECTION */}
        <VStack space="md">
          {isActiveLoading ? (
            <ActivityIndicator />
          ) : activeStay ? (
            /* CASE: HAS ACTIVE BOOKING */
            <Surface elevation={0} style={s.activeStayCard}>
              <HStack space="md" alignItems="center" mb={12}>
                <Box style={s.iconCircle}>
                  <MaterialCommunityIcons
                    name="home-heart"
                    size={24}
                    color={colors.primary}
                  />
                </Box>
                <VStack>
                  <Text style={s.cardLabel}>YOUR CURRENT STAY</Text>
                  <Text style={s.bhName}>{activeStay.boardingHouse?.name}</Text>
                </VStack>
              </HStack>

              <Divider style={s.cardDivider} />

              <HStack justifyContent="space-between" mt={12}>
                <VStack>
                  <Text style={s.statLabel}>Room</Text>
                  <Text style={s.statValue}>{activeStay.room?.roomNumber}</Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text style={s.statLabel}>Check-out</Text>
                  <Text style={s.statValue}>
                    {new Date(activeStay.checkOutDate).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>

              <TouchableRipple
                onPress={() =>
                  navigation.navigate("BookingStatusScreen", {
                    bookId: activeStay.id,
                  })
                }
                // onPress={() =>
                //   navigation.navigate("DashboardBookingStack", {
                //     screen: "BookingDetails",
                //     params: { id: activeStay.id },
                //   })
                // }
                style={s.cardAction}
              >
                <HStack space="xs" alignItems="center">
                  <Text style={s.actionText}>View Booking Details</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={colors.primary}
                  />
                </HStack>
              </TouchableRipple>
            </Surface>
          ) : pendingCount > 0 ? (
            /* CASE: HAS PENDING REQUESTS */
            <Surface
              elevation={0}
              style={[s.activeStayCard, { borderColor: "#EAB308" }]}
            >
              <HStack space="md" alignItems="center">
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color="#EAB308"
                />
                <VStack>
                  <Text style={[s.cardLabel, { color: "#EAB308" }]}>
                    PENDING REQUESTS ({pendingCount})
                  </Text>
                  <Text style={s.statValue}>Waiting for Owner Approval</Text>
                </VStack>
              </HStack>
              <TouchableRipple
                onPress={() => navigation.navigate("BookingStack")}
                style={s.cardAction}
              >
                <Text style={[s.actionText, { color: "#EAB308" }]}>
                  Check Status
                </Text>
              </TouchableRipple>
            </Surface>
          ) : (
            /* CASE: EMPTY STATE */
            <Surface elevation={0} style={s.emptyCard}>
              <MaterialCommunityIcons
                name="map-search-outline"
                size={40}
                color={colors.outline}
              />
              <Text style={s.emptyText}>
                You don't have any active bookings yet.
              </Text>
              <Pressable onPress={() => navigation.navigate("Explore")}>
                <Text style={s.exploreLink}>Explore Boarding Houses →</Text>
              </Pressable>
            </Surface>
          )}
        </VStack>

        {/* 4. QUICK ACTIONS (GRID) */}
        <VStack space="md">
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <HStack space="md" flexWrap="wrap">
            <ActionTile
              icon="calendar-check"
              label="My Bookings"
              onPress={() => navigation.navigate("BookingStack")}
            />
            <ActionTile
              icon="bookmark-outline"
              label="Saved"
              onPress={() => {}}
            />
            <ActionTile
              icon="history"
              label="Booking History"
              onPress={() => navigation.navigate("BookingHistoryScreen")}
            />
            <ActionTile icon="bell-outline" label="Alerts" onPress={() => {}} />
          </HStack>
        </VStack>

        {/* 5. PROMO / DISCOVERY WIDGET */}
        <Surface elevation={0} style={s.promoCard}>
          <HStack space="md" alignItems="center">
            <MaterialCommunityIcons
              name="bullhorn-variant-outline"
              size={24}
              color="white"
            />
            <VStack flex={1}>
              <Text style={s.promoTitle}>New boarding houses near you!</Text>
              <Text style={s.promoSub}>
                {markers.length} fresh listings in Ormoc this week.
              </Text>
            </VStack>
            <Box style={s.promoBadge}>
              <Text style={s.promoBadgeText}>Explore</Text>
            </Box>
          </HStack>
        </Surface>
      </VStack>
    </StaticScreenWrapper>
  );
}

/* SUB-COMPONENT FOR CLEANER GRID */
function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Surface elevation={0} style={s.tile}>
      <TouchableRipple onPress={onPress} style={s.tileRipple} borderless>
        <VStack alignItems="center" justifyContent="center" space="xs">
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={colors.primary}
          />
          <Text style={s.tileLabel}>{label}</Text>
        </VStack>
      </TouchableRipple>
    </Surface>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC", paddingHorizontal: Spacing.md },
  greeting: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 22,
    color: "#1A1A1A",
    marginTop: 12,
  },
  subGreeting: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#767474",
    marginTop: -4,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#357FC1",
    marginTop: 8,
  },

  /* ACTIVE STAY CARD */
  activeStayCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D6ECFA",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontFamily: "Poppins-Bold",
    fontSize: 10,
    letterSpacing: 1,
    color: "#357FC1",
  },
  bhName: { fontFamily: "Poppins-SemiBold", fontSize: 18, color: "#1A1A1A" },
  cardDivider: { marginVertical: 4, height: 1, backgroundColor: "#F0F0F5" },
  statLabel: { fontFamily: "Poppins-Regular", fontSize: 12, color: "#767474" },
  statValue: { fontFamily: "Poppins-Medium", fontSize: 14, color: "#1A1A1A" },
  cardAction: { marginTop: 16, paddingVertical: 8, alignItems: "center" },
  actionText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#357FC1",
  },

  /* EMPTY STATE */
  emptyCard: {
    padding: 30,
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },
  emptyText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#767474",
    marginTop: 12,
    textAlign: "center",
  },
  exploreLink: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#357FC1",
    marginTop: 8,
  },

  /* TILES */
  tile: {
    width: "47.5%", // 2 columns with gap
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "white",
    overflow: "hidden",
  },
  tileRipple: { flex: 1, justifyContent: "center", alignItems: "center" },
  tileLabel: { fontFamily: "Poppins-Medium", fontSize: 12, color: "#4A4A4A" },

  /* PROMO CARD */
  promoCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#357FC1",
  },
  promoTitle: { fontFamily: "Poppins-SemiBold", fontSize: 14, color: "white" },
  promoSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  promoBadge: {
    backgroundColor: "#FDD85D",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  promoBadgeText: {
    fontFamily: "Poppins-Bold",
    fontSize: 10,
    color: "#3A3A3A",
  },
});

/**
if has booking {
  🏠 Your Current Stay

  Boarding House: Sunflower Residences
  Room: 203
  📅 Until: April 25
  💰 Status: PAID

  [View Booking]
}else if no active and no pending {
  ⏳ Your Booking Requests (2)

  • Room 101 → Awaiting Approval
  • Room 202 → Awaiting Payment

  [View All Requests]
} else nothing in record {
  You don’t have any bookings yet

  [Explore Boarding Houses]
}

Other Activity
- 2 pending requests
- View history

[Quick Actions]
- My Bookings
- Saved Places
- Notifications

[Discover / Nearby]
 */
