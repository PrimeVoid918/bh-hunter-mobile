import React from "react";
import { Pressable, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Divider,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StayStatus } from "@/infrastructure/booking/booking.schema";

type StayStatusSectionProps = {
  isLoading: boolean;
  stayStatus: StayStatus | null;
  pendingCount: number;
  onPressActiveStay: () => void;
  onPressUpcomingStay: () => void;
  onPressPending: () => void;
  onPressExplore: () => void;
};

export default function StayStatusSection({
  isLoading,
  stayStatus,
  pendingCount,
  onPressActiveStay,
  onPressUpcomingStay,
  onPressPending,
  onPressExplore,
}: StayStatusSectionProps) {
  const { colors } = useTheme();

  const activeStay = stayStatus?.active ?? null;
  const upcomingStay = stayStatus?.upcoming ?? null;

  if (isLoading) {
    return (
      <VStack space="md">
        <ActivityIndicator />
      </VStack>
    );
  }

  if (activeStay) {
    return (
      <VStack space="md">
        <Surface elevation={0} style={s.activeStayCard}>
          <HStack space="md" alignItems="center" mb={12}>
            <Box style={s.iconCircle}>
              <MaterialCommunityIcons
                name="home-heart"
                size={24}
                color={colors.primary}
              />
            </Box>

            <VStack flex={1}>
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

          <TouchableRipple onPress={onPressActiveStay} style={s.cardAction}>
            <HStack space="xs" alignItems="center">
              <Text style={[s.actionText, { color: colors.primary }]}>
                View Booking Details
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color={colors.primary}
              />
            </HStack>
          </TouchableRipple>
        </Surface>
      </VStack>
    );
  }

  if (upcomingStay) {
    return (
      <VStack space="md">
        <Surface
          elevation={0}
          style={[s.activeStayCard, { borderColor: colors.primary }]}
        >
          <HStack space="md" alignItems="center" mb={12}>
            <Box style={s.iconCircle}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={24}
                color={colors.primary}
              />
            </Box>

            <VStack flex={1}>
              <Text style={s.cardLabel}>YOUR UPCOMING STAY</Text>
              <Text style={s.bhName}>{upcomingStay.boardingHouse?.name}</Text>
            </VStack>
          </HStack>

          <Divider style={s.cardDivider} />

          <HStack justifyContent="space-between" mt={12}>
            <VStack>
              <Text style={s.statLabel}>Room</Text>
              <Text style={s.statValue}>{upcomingStay.room?.roomNumber}</Text>
            </VStack>

            <VStack alignItems="flex-end">
              <Text style={s.statLabel}>Check-in</Text>
              <Text style={s.statValue}>
                {new Date(upcomingStay.checkInDate).toLocaleDateString()}
              </Text>
            </VStack>
          </HStack>

          <TouchableRipple onPress={onPressUpcomingStay} style={s.cardAction}>
            <HStack space="xs" alignItems="center">
              <Text style={[s.actionText, { color: colors.primary }]}>
                View Upcoming Booking
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color={colors.primary}
              />
            </HStack>
          </TouchableRipple>
        </Surface>
      </VStack>
    );
  }

  if (pendingCount > 0) {
    return (
      <VStack space="md">
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

          <TouchableRipple onPress={onPressPending} style={s.cardAction}>
            <Text style={[s.actionText, { color: "#EAB308" }]}>
              Check Status
            </Text>
          </TouchableRipple>
        </Surface>
      </VStack>
    );
  }

  return (
    <VStack space="md">
      <Surface elevation={0} style={s.emptyCard}>
        <MaterialCommunityIcons
          name="map-search-outline"
          size={40}
          color={colors.outline}
        />
        <Text style={s.emptyText}>You don't have any bookings yet.</Text>
        <Pressable onPress={onPressExplore}>
          <Text style={[s.exploreLink, { color: colors.primary }]}>
            Explore Boarding Houses →
          </Text>
        </Pressable>
      </Surface>
    </VStack>
  );
}

const s = StyleSheet.create({
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
  bhName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1A1A1A",
  },
  cardDivider: {
    marginVertical: 4,
    height: 1,
    backgroundColor: "#F0F0F5",
  },
  statLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
  },
  statValue: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#1A1A1A",
  },
  cardAction: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  actionText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
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
    marginTop: 8,
  },
});
