import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Text,
  useTheme,
  Surface,
  IconButton,
  Divider,
} from "react-native-paper";
import {
  VStack,
  HStack,
  Box,
  Button,
  ButtonText,
  Badge,
  BadgeText,
} from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Spacing, BorderRadius } from "@/constants";
import { useGetAllQuery } from "@/infrastructure/booking/booking.redux.api";
import { useGetOneQuery } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { parseIsoDate } from "@/infrastructure/utils/date-and-time/parseISODate.util";
import { OwnerBookingStackParamList } from "./navigation/booking.types";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { Lists } from "@/components/layout/Lists/Lists";

type RouteProps = RouteProp<
  OwnerBookingStackParamList,
  "PropertiesBookingListsScreen"
>;

export default function PropertiesBookingListsScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<OwnerBookingStackParamList>>();
  const route = useRoute<RouteProps>();
  const { bhId } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const {
    data: bookingList,
    isLoading: isBookingListLoading,
    refetch,
  } = useGetAllQuery({
    limit: 20,
    page: 1,
    boardingHouseId: bhId!,
  });
  const { data: boardingHouseData } = useGetOneQuery(bhId);

  const handlePageRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { action: "success", label: "Completed", icon: "check-circle" };
      case "PENDING":
        return { action: "warning", label: "Pending", icon: "clock-outline" };
      case "CANCELLED":
        return { action: "error", label: "Cancelled", icon: "close-circle" };
      default:
        return { action: "muted", label: status, icon: "information" };
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => {
    const statusCfg = getStatusConfig(item.status);
    const checkIn = parseIsoDate(item.checkInDate);
    const checkOut = parseIsoDate(item.checkOutDate);

    return (
      <Surface elevation={0} style={s.card}>
        <VStack p={Spacing.md} gap={Spacing.sm}>
          {/* Header Row: Room & Status */}
          <HStack justifyContent="space-between" alignItems="center">
            <HStack alignItems="center" gap={Spacing.sm}>
              <Box
                style={[
                  s.roomBadge,
                  { backgroundColor: colors.primaryContainer },
                ]}
              >
                <Text
                  variant="titleMedium"
                  style={{
                    color: colors.onPrimaryContainer,
                    fontFamily: "Poppins-Bold",
                  }}
                >
                  {item.room.roomNumber}
                </Text>
              </Box>
              <VStack>
                <Text variant="labelSmall" style={{ color: colors.outline }}>
                  REFERENCE
                </Text>
                <Text variant="bodySmall" numberOfLines={1} style={s.refText}>
                  {item.reference}
                </Text>
              </VStack>
            </HStack>
            <Badge
              size="md"
              variant="solid"
              action={statusCfg.action as any}
              borderRadius="$full"
            >
              <BadgeText style={s.badgeText}>{statusCfg.label}</BadgeText>
            </Badge>
          </HStack>

          <Divider style={s.divider} />

          {/* Body: Dates & Tenant */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack gap={2}>
              <HStack alignItems="center" gap={4}>
                <MaterialCommunityIcons
                  name="calendar-import"
                  size={14}
                  color={colors.primary}
                />
                <Text variant="bodySmall" style={s.dateText}>
                  {checkIn?.monthName} {checkIn?.day}, {checkIn?.year}
                </Text>
              </HStack>
              <HStack alignItems="center" gap={4}>
                <MaterialCommunityIcons
                  name="calendar-export"
                  size={14}
                  color={colors.error}
                />
                <Text variant="bodySmall" style={s.dateText}>
                  {checkOut?.monthName} {checkOut?.day}, {checkOut?.year}
                </Text>
              </HStack>
            </VStack>

            <Button
              size="sm"
              variant="outline"
              style={s.detailsBtn}
              onPress={() =>
                navigation.navigate("BookingStatusScreen", { bookId: item.id })
              }
            >
              <ButtonText style={s.btnText}>View Details</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </Surface>
    );
  };

  return (
    <StaticScreenWrapper variant="list" loading={isBookingListLoading}>
      <VStack p={Spacing.md} gap={Spacing.md}>
        {boardingHouseData && (
          <VStack>
            <Text
              variant="labelLarge"
              style={{ color: colors.primary, letterSpacing: 1 }}
            >
              BOOKING LOGS
            </Text>
            <Text variant="headlineSmall" style={s.headerTitle}>
              {boardingHouseData.name}
            </Text>
          </VStack>
        )}

        {bookingList && bookingList.length > 0 ? (
          <Lists
            list={bookingList}
            renderItem={renderBookingItem}
            refreshing={refreshing}
            onRefresh={handlePageRefresh}
            contentContainerStyle={{ gap: Spacing.md, paddingBottom: 40 }}
          />
        ) : (
          <Box py={Spacing.xl} alignItems="center">
            <MaterialCommunityIcons
              name="calendar-blank"
              size={48}
              color={colors.outlineVariant}
            />
            <Text
              variant="bodyMedium"
              style={{ color: colors.outline, marginTop: 8 }}
            >
              No bookings found for this property.
            </Text>
          </Box>
        )}
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  headerTitle: { fontFamily: "Poppins-Bold", color: "#1A1A1A" },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  roomBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  refText: { fontFamily: "Poppins-Medium", fontSize: 11, maxWidth: 120 },
  divider: { backgroundColor: "#EEEEEE", height: 1 },
  dateText: { fontFamily: "Poppins-Regular", color: "#444" },
  detailsBtn: {
    borderColor: "#357FC1",
    height: 32,
    borderRadius: BorderRadius.sm,
  },
  btnText: { fontSize: 12, color: "#357FC1", fontFamily: "Poppins-Medium" },
  badgeText: {
    fontSize: 10,
    fontFamily: "Poppins-Bold",
    textTransform: "uppercase",
  },
});
