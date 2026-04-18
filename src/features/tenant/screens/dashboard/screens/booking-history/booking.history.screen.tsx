import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import {
  Text,
  Surface,
  TouchableRipple,
  useTheme,
  Divider,
  Avatar,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { VStack, HStack, Box } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { useGetAllQuery } from "@/infrastructure/booking/booking.redux.api";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import {
  getBookingStatusDetails,
  GetBooking,
} from "@/infrastructure/booking/booking.schema";
import { Colors, Spacing, BorderRadius, Fontsize } from "@/constants";

export default function BookingHistoryScreen() {
  const { colors } = useTheme();
  const { selectedUser: user } = useDynamicUserApi();
  const navigation = useNavigation<any>();

  // Fetching history (everything that isn't PENDING or AWAITING_PAYMENT)
  const {
    data: bookings,
    isLoading,
    refetch,
  } = useGetAllQuery(
    {
      tenantId: user?.id,
    },
    { skip: !user?.id },
  );

  // Filter for history: Completed, Cancelled, Rejected, or Refunded
  const historyData =
    bookings?.filter((b) =>
      [
        "COMPLETED_BOOKING",
        "CANCELLED_BOOKING",
        "REJECTED_BOOKING",
        "REFUNDED_PAYMENT",
      ].includes(b.status),
    ) || [];

  const renderHistoryItem = ({ item }: { item: GetBooking }) => {
    const statusInfo = getBookingStatusDetails(item.status);
    const isCompleted = item.status === "COMPLETED_BOOKING";

    return (
      <Surface elevation={0} style={s.card}>
        <TouchableRipple
          onPress={() => navigation.navigate("BookingDetails", { id: item.id })}
          style={s.ripple}
        >
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="flex-start">
              <HStack space="sm" flex={1}>
                <Avatar.Image
                  size={48}
                  source={
                    item.room?.thumbnail?.[0]?.url
                      ? { uri: item.room.thumbnail[0].url }
                      : require("@/assets/static/no-image.jpg")
                  }
                />
                <VStack flex={1}>
                  <Text style={s.bhName}>
                    {item.boardingHouse?.name ?? "Unknown BH"}
                  </Text>
                  <Text style={s.roomInfo}>Room {item.room?.roomNumber}</Text>
                </VStack>
              </HStack>

              <Box
                style={[
                  s.statusBadge,
                  { backgroundColor: statusInfo.color + "20" },
                ]}
              >
                <Text style={[s.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label.toUpperCase()}
                </Text>
              </Box>
            </HStack>

            <Divider style={s.divider} />

            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text style={s.dateLabel}>Stay Duration</Text>
                <Text style={s.dateValue}>
                  {new Date(item.checkInDate).toLocaleDateString()} -{" "}
                  {new Date(item.checkOutDate).toLocaleDateString()}
                </Text>
              </VStack>
              <VStack alignItems="flex-end">
                <Text style={s.dateLabel}>Total Paid</Text>
                <Text style={s.priceValue}>₱{item.totalAmount ?? "0.00"}</Text>
              </VStack>
            </HStack>

            {item.status === "REJECTED_BOOKING" && item.ownerMessage && (
              <Box style={s.reasonBox}>
                <Text style={s.reasonText}>Reason: {item.ownerMessage}</Text>
              </Box>
            )}
          </VStack>
        </TouchableRipple>
      </Surface>
    );
  };

  return (
    <StaticScreenWrapper
      loading={isLoading}
      onRefresh={refetch}
      style={s.container}
    >
      <VStack space="md" p={Spacing.md}>
        <Text style={s.headerTitle}>Past Activity</Text>
        <Text style={s.headerSub}>
          Records of your previous stays and requests.
        </Text>

        <FlatList
          data={historyData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          scrollEnabled={false} // Wrapper handles scrolling
          ListEmptyComponent={
            <VStack alignItems="center" pt={60} space="sm">
              <MaterialCommunityIcons
                name="history"
                size={60}
                color={colors.outline}
              />
              <Text
                style={{ color: colors.outline, fontFamily: "Poppins-Medium" }}
              >
                No history found
              </Text>
            </VStack>
          }
        />
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  headerTitle: { fontFamily: "Poppins-Bold", fontSize: 24, color: "#1A1A1A" },
  headerSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#767474",
    marginTop: -4,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "white",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  ripple: { padding: 16 },
  bhName: { fontFamily: "Poppins-SemiBold", fontSize: 16, color: "#1A1A1A" },
  roomInfo: { fontFamily: "Poppins-Regular", fontSize: 13, color: "#767474" },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: "Poppins-Bold",
    fontSize: 10,
  },

  divider: { marginVertical: 4, backgroundColor: "#F0F0F5" },

  dateLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#9E9E9E",
    textTransform: "uppercase",
  },
  dateValue: { fontFamily: "Poppins-Medium", fontSize: 13, color: "#424242" },
  priceValue: { fontFamily: "Poppins-Bold", fontSize: 15, color: "#1A1A1A" },

  reasonBox: {
    backgroundColor: "#FFF5F5",
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  reasonText: {
    fontFamily: "Poppins-Italic",
    fontSize: 12,
    color: "#B91C1C",
  },
});
