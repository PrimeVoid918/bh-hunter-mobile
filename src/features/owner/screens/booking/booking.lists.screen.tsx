import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Text,
  useTheme,
  Surface,
  Divider,
  TouchableRipple,
} from "react-native-paper";
import { VStack, HStack, Box, Button, ButtonText } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Spacing, BorderRadius } from "@/constants";
import { useGetAllQuery } from "@/infrastructure/booking/booking.redux.api";
import { useGetOneQuery } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import {
  BookingStatus,
  GetBooking,
  getBookingStatusDetails,
} from "@/infrastructure/booking/booking.schema";
import { parseIsoDate } from "@/infrastructure/utils/date-and-time/parseISODate.util";
import { OwnerBookingStackParamList } from "./navigation/booking.types";
import { Lists } from "@/components/layout/Lists/Lists";

type RouteProps = RouteProp<OwnerBookingStackParamList, "BookingListsScreen">;

type FilterKey =
  | "ALL"
  | "NEEDS_ACTION"
  | "PENDING_REQUEST"
  | "AWAITING_PAYMENT"
  | "PAYMENT_APPROVAL"
  | "COMPLETED_BOOKING"
  | "CANCELLED_REJECTED";

const ACTION_REQUIRED_STATUSES: BookingStatus[] = [
  "PENDING_REQUEST",
  "AWAITING_PAYMENT",
  "PAYMENT_APPROVAL",
  "PAYMENT_FAILED",
];

const STATUS_PRIORITY: Record<string, number> = {
  PENDING_REQUEST: 1,
  PAYMENT_APPROVAL: 2,
  AWAITING_PAYMENT: 3,
  PAYMENT_FAILED: 4,
  COMPLETED_BOOKING: 5,
  REFUNDED_PAYMENT: 6,
  CANCELLED_BOOKING: 7,
  REJECTED_BOOKING: 8,
};

export default function BookingListsScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<OwnerBookingStackParamList>>();
  const route = useRoute<RouteProps>();
  const { bhId } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");

  const {
    data: bookingList = [],
    isLoading: isBookingListLoading,
    refetch,
  } = useGetAllQuery({
    limit: 50,
    page: 1,
    boardingHouseId: bhId!,
  });

  const { data: boardingHouseData } = useGetOneQuery(bhId);

  const handlePageRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const counts = useMemo(() => {
    const pending = bookingList.filter(
      (item) => item.status === "PENDING_REQUEST",
    ).length;

    const awaitingPayment = bookingList.filter(
      (item) => item.status === "AWAITING_PAYMENT",
    ).length;

    const paymentApproval = bookingList.filter(
      (item) => item.status === "PAYMENT_APPROVAL",
    ).length;

    const needsAction = bookingList.filter((item) =>
      ACTION_REQUIRED_STATUSES.includes(item.status as BookingStatus),
    ).length;

    const completed = bookingList.filter(
      (item) => item.status === "COMPLETED_BOOKING",
    ).length;

    return {
      pending,
      awaitingPayment,
      paymentApproval,
      needsAction,
      completed,
      total: bookingList.length,
    };
  }, [bookingList]);

  const filterOptions = useMemo(
    () => [
      { key: "ALL" as FilterKey, label: "All", count: counts.total },
      {
        key: "NEEDS_ACTION" as FilterKey,
        label: "Needs Action",
        count: counts.needsAction,
      },
      {
        key: "PENDING_REQUEST" as FilterKey,
        label: "Pending",
        count: counts.pending,
      },
      {
        key: "AWAITING_PAYMENT" as FilterKey,
        label: "Awaiting Payment",
        count: counts.awaitingPayment,
      },
      {
        key: "COMPLETED_BOOKING" as FilterKey,
        label: "Confirmed",
        count: counts.completed,
      },
    ],
    [counts],
  );

  const filteredBookings = useMemo(() => {
    let result = [...bookingList];

    switch (activeFilter) {
      case "NEEDS_ACTION":
        result = result.filter((item) =>
          ACTION_REQUIRED_STATUSES.includes(item.status as BookingStatus),
        );
        break;

      case "PENDING_REQUEST":
      case "AWAITING_PAYMENT":
      case "PAYMENT_APPROVAL":
      case "COMPLETED_BOOKING":
        result = result.filter((item) => item.status === activeFilter);
        break;

      case "CANCELLED_REJECTED":
        result = result.filter(
          (item) =>
            item.status === "CANCELLED_BOOKING" ||
            item.status === "REJECTED_BOOKING",
        );
        break;

      default:
        break;
    }

    return result.sort((a, b) => {
      const aPriority = STATUS_PRIORITY[a.status] ?? 999;
      const bPriority = STATUS_PRIORITY[b.status] ?? 999;

      if (aPriority !== bPriority) return aPriority - bPriority;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [bookingList, activeFilter]);

  const getTone = (status: BookingStatus) => {
    switch (status) {
      case "PENDING_REQUEST":
        return {
          bg: colors.secondary,
          text: colors.onSecondary,
          icon: "clock-outline",
        };
      case "AWAITING_PAYMENT":
        return {
          bg: colors.primaryContainer,
          text: colors.primary,
          icon: "clock-outline",
        };
      case "PAYMENT_APPROVAL":
        return {
          bg: "#FFE7D6",
          text: "#B45309",
          icon: "shield-check-outline",
        };
      case "COMPLETED_BOOKING":
        return {
          bg: "#DFF4E7",
          text: "#1E7A46",
          icon: "check-circle-outline",
        };
      case "PAYMENT_FAILED":
      case "CANCELLED_BOOKING":
      case "REJECTED_BOOKING":
        return {
          bg: "#FDE2E2",
          text: colors.error,
          icon: "alert-circle-outline",
        };
      case "REFUNDED_PAYMENT":
        return {
          bg: "#EEE7FF",
          text: "#6D28D9",
          icon: "cash-refund",
        };
      default:
        return {
          bg: colors.surfaceVariant,
          text: colors.onSurface,
          icon: "information-outline",
        };
    }
  };

  const getActionLabel = (status: BookingStatus) => {
    switch (status) {
      case "PENDING_REQUEST":
        return "Review Request";
      case "AWAITING_PAYMENT":
        return "Check Payment";
      default:
        return "View Details";
    }
  };

  const renderBookingItem = ({ item }: { item: GetBooking }) => {
    const statusMeta = getBookingStatusDetails(item.status);
    const tone = getTone(item.status as BookingStatus);
    const checkIn = parseIsoDate(item.checkInDate);
    const checkOut = parseIsoDate(item.checkOutDate);

    return (
      <Surface
        elevation={0}
        style={[
          s.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <VStack p={Spacing.md} gap={Spacing.sm}>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack alignItems="center" gap={Spacing.sm} flex={1}>
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
                  {item.room?.roomNumber ?? "-"}
                </Text>
              </Box>

              <VStack flex={1}>
                <Text variant="labelSmall" style={{ color: colors.outline }}>
                  REFERENCE
                </Text>
                <Text variant="bodySmall" numberOfLines={1} style={s.refText}>
                  {item.reference}
                </Text>

                {!!item.tenant && (
                  <HStack alignItems="center" gap={4} style={{ marginTop: 4 }}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={14}
                      color={colors.outline}
                    />
                    <Text
                      variant="bodySmall"
                      style={[s.metaText, { color: colors.outline }]}
                      numberOfLines={1}
                    >
                      {[item.tenant?.firstname, item.tenant?.lastname]
                        .filter(Boolean)
                        .join(" ")}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </HStack>

            <Box
              style={[
                s.statusPill,
                {
                  backgroundColor: tone.bg,
                },
              ]}
            >
              <HStack alignItems="center" gap={4}>
                <MaterialCommunityIcons
                  name={tone.icon as any}
                  size={13}
                  color={tone.text}
                />
                <Text style={[s.statusText, { color: tone.text }]}>
                  {statusMeta.label}
                </Text>
              </HStack>
            </Box>
          </HStack>

          <Divider
            style={[s.divider, { backgroundColor: colors.outlineVariant }]}
          />

          <HStack justifyContent="space-between" alignItems="center">
            <VStack gap={4} flex={1}>
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
              style={[s.detailsBtn, { borderColor: colors.primary }]}
              onPress={() =>
                navigation.navigate("BookingStatusScreen", { bookId: item.id })
              }
            >
              <ButtonText style={[s.btnText, { color: colors.primary }]}>
                {getActionLabel(item.status as BookingStatus)}
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </Surface>
    );
  };

  return (
    <StaticScreenWrapper
      variant="list"
      loading={isBookingListLoading}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
    >
      <VStack p={Spacing.md} gap={Spacing.md}>
        {boardingHouseData && (
          <VStack>
            <Text
              variant="labelLarge"
              style={{ color: colors.primary, letterSpacing: 1 }}
            >
              BOOKING WORKSPACE
            </Text>
            <Text variant="headlineSmall" style={s.headerTitle}>
              {boardingHouseData.name}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: colors.outline, fontFamily: "Poppins-Regular" }}
            >
              Filter bookings by status and open the ones that need action.
            </Text>
          </VStack>
        )}

        <HStack style={s.summaryRow}>
          <Surface
            elevation={0}
            style={[
              s.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <Text style={s.summaryValue}>{counts.needsAction}</Text>
            <Text style={[s.summaryLabel, { color: colors.outline }]}>
              Needs Action
            </Text>
          </Surface>

          <Surface
            elevation={0}
            style={[
              s.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <Text style={s.summaryValue}>{counts.completed}</Text>
            <Text style={[s.summaryLabel, { color: colors.outline }]}>
              Confirmed
            </Text>
          </Surface>
        </HStack>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {filterOptions.map((filter) => {
            const selected = activeFilter === filter.key;

            return (
              <Surface
                key={filter.key}
                elevation={0}
                style={[
                  s.filterChip,
                  {
                    backgroundColor: selected
                      ? colors.primaryContainer
                      : colors.surface,
                    borderColor: selected
                      ? colors.primary
                      : colors.outlineVariant,
                  },
                ]}
              >
                <TouchableRipple
                  borderless={false}
                  onPress={() => setActiveFilter(filter.key)}
                  style={s.filterRipple}
                >
                  <HStack alignItems="center" gap={Spacing.xs}>
                    <Text
                      style={[
                        s.filterText,
                        {
                          color: selected ? colors.primary : colors.onSurface,
                        },
                      ]}
                    >
                      {filter.label}
                    </Text>
                    <Box
                      style={[
                        s.filterCount,
                        {
                          backgroundColor: selected
                            ? colors.primary
                            : colors.surfaceVariant,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.filterCountText,
                          {
                            color: selected
                              ? colors.onPrimary
                              : colors.onSurface,
                          },
                        ]}
                      >
                        {filter.count}
                      </Text>
                    </Box>
                  </HStack>
                </TouchableRipple>
              </Surface>
            );
          })}
        </ScrollView>

        {filteredBookings.length > 0 ? (
          <Lists
            list={filteredBookings}
            renderItem={renderBookingItem}
            contentContainerStyle={{ gap: Spacing.md, paddingBottom: 40 }}
          />
        ) : (
          <Surface
            elevation={0}
            style={[
              s.emptyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <VStack alignItems="center" gap={Spacing.sm}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={42}
                color={colors.outlineVariant}
              />
              <Text variant="titleMedium" style={s.emptyTitle}>
                No bookings in this filter
              </Text>
              <Text
                variant="bodySmall"
                style={[s.emptyText, { color: colors.outline }]}
              >
                Try another filter or refresh the list.
              </Text>
            </VStack>
          </Surface>
        )}
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  headerTitle: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },

  summaryRow: {
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
  },
  summaryValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
    color: "#1A1A1A",
  },
  summaryLabel: {
    fontFamily: "Poppins-Regular",
    marginTop: 2,
    fontSize: 12,
  },

  filterRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.base,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
  filterRipple: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filterText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  filterCount: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  filterCountText: {
    fontFamily: "Poppins-Bold",
    fontSize: 10,
  },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  roomBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  refText: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    maxWidth: 140,
  },
  metaText: {
    fontFamily: "Poppins-Regular",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: "Poppins-Bold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
  },
  dateText: {
    fontFamily: "Poppins-Regular",
    color: "#444",
  },
  detailsBtn: {
    height: 34,
    borderRadius: BorderRadius.sm,
  },
  btnText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },

  emptyCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingVertical: 32,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    color: "#1A1A1A",
  },
  emptyText: {
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
});
