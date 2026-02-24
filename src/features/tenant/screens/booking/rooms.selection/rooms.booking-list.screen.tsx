import React, { useMemo, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import {
  Text,
  Surface,
  useTheme,
  TouchableRipple,
  Divider,
} from "react-native-paper";
import { VStack, HStack, Badge, BadgeText, Box } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Spacing, BorderRadius } from "@/constants";
import { useGetOneQuery as useGetOneBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { Lists } from "@/components/layout/Lists/Lists";
import {
  RoomsBookingScreenRouteProp,
  TenantBookingStackParamList,
} from "../navigation/booking.types";

export default function RoomsBookingListScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<TenantBookingStackParamList>>();
  const route = useRoute<RoomsBookingScreenRouteProp>();
  const { paramsId } = route.params;

  const {
    data: bhData,
    isLoading,
    isError,
    refetch,
  } = useGetOneBoardingHouse(paramsId);

  const rooms = useMemo(() => bhData?.rooms ?? [], [bhData]);
  const [refreshing, setRefreshing] = useState(false);

  const triggerHaptic = () => ReactNativeHapticFeedback.trigger("impactLight");

  const handlePageRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderTenantRoomCard = ({ item }: { item: any }) => {
    const thumbnailUrl = item.thumbnail?.[0]?.url || null;
    const isAvailable = item.availabilityStatus;

    return (
      <Surface
        elevation={0}
        style={[s.roomCard, { borderColor: colors.outlineVariant }]}
      >
        <TouchableRipple
          onPress={() => {
            triggerHaptic();
            navigation.navigate("RoomsDetailsScreen", {
              roomId: item.id,
              boardingHouseId: item.boardingHouseId,
              ownerId: bhData?.ownerId,
            });
          }}
          rippleColor="rgba(53, 127, 193, 0.1)"
        >
          <VStack>
            <HStack p={Spacing.base} gap={Spacing.md} alignItems="center">
              {/* --- 1. IMAGE BOX --- */}
              <Box style={s.imageWrapper}>
                {thumbnailUrl ? (
                  <Image source={{ uri: thumbnailUrl }} style={s.thumbnail} />
                ) : (
                  <Box
                    style={[
                      s.placeholder,
                      { backgroundColor: colors.surfaceVariant },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="bed-outline"
                      size={24}
                      color={colors.outline}
                    />
                  </Box>
                )}
              </Box>

              {/* --- 2. ROOM INFO --- */}
              <VStack flex={1} gap={2}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text variant="titleMedium" style={s.roomNumber}>
                    Room {item.roomNumber}
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={{
                      color: colors.primary,
                      fontFamily: "Poppins-Bold",
                    }}
                  >
                    ₱{item.price.toLocaleString()}
                  </Text>
                </HStack>

                <Text
                  variant="bodySmall"
                  style={{ color: colors.outline }}
                  numberOfLines={1}
                >
                  {item.roomType || "Standard"} •{" "}
                  {item.furnishingType || "Unfurnished"}
                </Text>

                <HStack gap={Spacing.sm} mt={4} alignItems="center">
                  <Badge
                    action={isAvailable ? "success" : "error"}
                    variant="solid"
                    borderRadius="$full"
                  >
                    <BadgeText
                      style={
                        isAvailable
                          ? colors.availableText
                          : colors.notAvailableText
                      }
                    >
                      {isAvailable ? "Available" : "Not Available"}
                    </BadgeText>
                  </Badge>

                  <HStack alignItems="center" gap={4}>
                    <MaterialCommunityIcons
                      name="account-multiple-outline"
                      size={14}
                      color={colors.outline}
                    />
                    <Text
                      variant="labelSmall"
                      style={{ color: colors.outline }}
                    >
                      Up to {item.maxCapacity}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>

            <Divider style={s.divider} />

            {/* --- 3. TENANT FOOTER --- */}
            <HStack
              px={Spacing.base}
              py={Spacing.sm}
              justifyContent="space-between"
              alignItems="center"
              style={s.cardFooter}
            >
              <Text
                variant="labelMedium"
                style={{
                  color: colors.primary,
                  fontFamily: "Poppins-SemiBold",
                }}
              >
                Tap for room details & amenities
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.primary}
              />
            </HStack>
          </VStack>
        </TouchableRipple>
      </Surface>
    );
  };

  return (
    <StaticScreenWrapper
      variant="list"
      style={{ backgroundColor: colors.background }}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isLoading}
      error={[isError ? "Failed to load rooms" : null]}
    >
      <VStack gap={Spacing.lg}>
        {/* --- DYNAMIC HEADER --- */}
        <VStack>
          <Text variant="displaySmall" style={s.headerText}>
            Select a Room
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.outline }}>
            Exploring rooms at{" "}
            <Text style={s.bhLink}>{bhData?.name || "this property"}</Text>
          </Text>
        </VStack>

        <Lists
          list={rooms}
          contentContainerStyle={s.listContent}
          renderItem={renderTenantRoomCard}
          renderEmpty={() => (
            <VStack style={s.emptyState} space="md">
              <MaterialCommunityIcons
                name="home-search"
                size={48}
                color={colors.outlineVariant}
              />
              <Text variant="titleMedium" style={{ color: colors.outline }}>
                No active rooms found
              </Text>
            </VStack>
          )}
        />
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  headerText: {
    fontFamily: "Poppins-Bold",
    letterSpacing: -0.5,
    color: "#1A1A1A",
  },
  bhLink: { color: "#357FC1", fontFamily: "Poppins-SemiBold" },
  listContent: { paddingBottom: 60, gap: Spacing.md },
  roomCard: {
    borderRadius: BorderRadius.xl, // 16px for Dashboard/List consistency
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  thumbnail: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  roomNumber: { fontFamily: "Poppins-SemiBold", color: "#1A1A1A" },
  badgeText: {
    fontSize: 9,
    fontFamily: "Poppins-Bold",
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
  divider: { backgroundColor: "#F0F0F5", height: 1 },
  cardFooter: { backgroundColor: "#F7F9FC" },
});
