import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { VStack, HStack, Badge, BadgeText, Box } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { BorderRadius, Spacing } from "@/constants";
import { useGetAllQuery as useGetAllBoardingHouses } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { RootState } from "@/application/store/stores";
import { Lists } from "@/components/layout/Lists/Lists";
import { OwnerBookingStackParamList } from "./navigation/booking.types";

export default function BookingMainScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<BottomTabNavigationProp<OwnerBookingStackParamList>>();

  const ownerId = useSelector(
    (state: RootState) => state.owners.selectedUser?.id,
  );

  const [refreshing, setRefreshing] = useState(false);

  const {
    data: boardinghouses = [],
    isLoading,
    refetch,
  } = useGetAllBoardingHouses({ ownerId });

  const handlePageRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNavigate = (id: number) => {
    ReactNativeHapticFeedback.trigger("impactLight");
    navigation.navigate("BookingListsScreen", { bhId: id });
  };

  const totalProperties = boardinghouses.length;
  const totalRooms = useMemo(() => {
    return boardinghouses.reduce(
      (sum: number, item: any) => sum + (item?.rooms?.length ?? 0),
      0,
    );
  }, [boardinghouses]);

  const hasProperties = totalProperties > 0;

  return (
    <StaticScreenWrapper
      variant="list"
      style={{ backgroundColor: colors.background }}
      loading={isLoading}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
    >
      <View style={s.mainContainer}>
        <VStack style={s.headerSection} space="xs">
          <Text
            variant="displaySmall"
            style={[s.title, { color: colors.onSurface }]}
          >
            Bookings
          </Text>
          <Text
            variant="bodyMedium"
            style={[s.subtitle, { color: colors.outline }]}
          >
            Select a property to manage booking requests, payments, and stay
            confirmations.
          </Text>
        </VStack>

        <HStack style={s.metricsRow}>
          <Surface
            elevation={0}
            style={[
              s.metricCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <HStack alignItems="center" gap={Spacing.sm}>
              <Box
                style={[
                  s.metricIconWrap,
                  { backgroundColor: colors.primaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="office-building"
                  size={20}
                  color={colors.primary}
                />
              </Box>

              <VStack>
                <Text
                  variant="headlineSmall"
                  style={[s.metricValue, { color: colors.onSurface }]}
                >
                  {totalProperties}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[s.metricLabel, { color: colors.outline }]}
                >
                  Properties
                </Text>
              </VStack>
            </HStack>
          </Surface>

          <Surface
            elevation={0}
            style={[
              s.metricCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <HStack alignItems="center" gap={Spacing.sm}>
              <Box
                style={[
                  s.metricIconWrap,
                  { backgroundColor: colors.primaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="door-open"
                  size={20}
                  color={colors.primary}
                />
              </Box>

              <VStack>
                <Text
                  variant="headlineSmall"
                  style={[s.metricValue, { color: colors.onSurface }]}
                >
                  {totalRooms}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[s.metricLabel, { color: colors.outline }]}
                >
                  Rooms
                </Text>
              </VStack>
            </HStack>
          </Surface>
        </HStack>

        <Surface
          elevation={0}
          style={[
            s.infoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <HStack alignItems="flex-start" gap={Spacing.sm}>
            <Box
              style={[
                s.infoIconWrap,
                { backgroundColor: colors.primaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={20}
                color={colors.primary}
              />
            </Box>

            <VStack flex={1}>
              <Text
                variant="titleMedium"
                style={[s.infoTitle, { color: colors.onSurface }]}
              >
                Booking Workspace
              </Text>
              <Text
                variant="bodySmall"
                style={[s.infoText, { color: colors.outline }]}
              >
                Review each property’s booking list, then open details for
                approval, rejection, or payment verification.
              </Text>
            </VStack>
          </HStack>
        </Surface>

        <VStack style={s.sectionHeader}>
          <Text
            variant="titleLarge"
            style={[s.sectionTitle, { color: colors.onSurface }]}
          >
            Your Properties
          </Text>
          <Text
            variant="bodySmall"
            style={[s.sectionSubtitle, { color: colors.outline }]}
          >
            Tap a property below to view and manage its bookings.
          </Text>
        </VStack>

        {hasProperties ? (
          <Lists
            list={boardinghouses}
            contentContainerStyle={s.listContent}
            renderItem={({ item }: { item: any }) => {
              const roomCount = item?.rooms?.length ?? 0;

              return (
                <Surface
                  elevation={0}
                  style={[
                    s.propertyCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <TouchableRipple
                    borderless={false}
                    rippleColor="rgba(53,127,193,0.08)"
                    onPress={() => handleNavigate(item.id)}
                    style={s.rippleArea}
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack flex={1} gap={Spacing.md} alignItems="center">
                        <Box
                          style={[
                            s.propertyIconWrap,
                            { backgroundColor: colors.primaryContainer },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="office-building-marker-outline"
                            size={24}
                            color={colors.primary}
                          />
                        </Box>

                        <VStack flex={1} space="xs">
                          <Text
                            variant="titleMedium"
                            style={[
                              s.propertyName,
                              { color: colors.onSurface },
                            ]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>

                          {!!item.address && (
                            <HStack alignItems="center" gap={4}>
                              <MaterialCommunityIcons
                                name="map-marker-outline"
                                size={14}
                                color={colors.outline}
                              />
                              <Text
                                variant="bodySmall"
                                style={[
                                  s.propertyMeta,
                                  { color: colors.outline },
                                ]}
                                numberOfLines={1}
                              >
                                {item.address}
                              </Text>
                            </HStack>
                          )}

                          <HStack alignItems="center" gap={4}>
                            <MaterialCommunityIcons
                              name="door-open"
                              size={14}
                              color={colors.outline}
                            />
                            <Text
                              variant="bodySmall"
                              style={[
                                s.propertyMeta,
                                { color: colors.outline },
                              ]}
                            >
                              {roomCount} {roomCount === 1 ? "Room" : "Rooms"}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>

                      <HStack alignItems="center" gap={Spacing.sm}>
                        <Badge
                          size="md"
                          variant="solid"
                          borderRadius="$full"
                          style={[
                            s.manageBadge,
                            { backgroundColor: colors.secondary },
                          ]}
                        >
                          <BadgeText
                            style={[
                              s.manageBadgeText,
                              { color: colors.onSecondary },
                            ]}
                          >
                            Manage
                          </BadgeText>
                        </Badge>

                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={22}
                          color={colors.outlineVariant}
                        />
                      </HStack>
                    </HStack>
                  </TouchableRipple>
                </Surface>
              );
            }}
          />
        ) : (
          <Surface
            elevation={0}
            style={[
              s.emptyStateCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <VStack alignItems="center" space="md">
              <Box
                style={[
                  s.emptyIconWrap,
                  { backgroundColor: colors.primaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={30}
                  color={colors.primary}
                />
              </Box>

              <VStack alignItems="center" space="xs">
                <Text
                  variant="titleMedium"
                  style={[s.emptyTitle, { color: colors.onSurface }]}
                >
                  No properties yet
                </Text>
                <Text
                  variant="bodySmall"
                  style={[s.emptyText, { color: colors.outline }]}
                >
                  Add a boarding house first so you can start receiving and
                  managing bookings.
                </Text>
              </VStack>
            </VStack>
          </Surface>
        )}
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainContainer: {
    // paddingHorizontal: Spacing.base,
    // paddingTop: Spacing.sm,
    // paddingBottom: 40,
  },

  headerSection: {
    marginBottom: Spacing.base,
  },
  title: {
    fontFamily: "Poppins-Bold",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    marginTop: -4,
    lineHeight: 20,
  },

  metricsRow: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    overflow: "hidden",
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  metricValue: {
    fontFamily: "Poppins-Bold",
    lineHeight: 28,
  },
  metricLabel: {
    fontFamily: "Poppins-Regular",
    marginTop: -2,
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTitle: {
    fontFamily: "Poppins-SemiBold",
  },
  infoText: {
    fontFamily: "Poppins-Regular",
    marginTop: 2,
    lineHeight: 19,
  },

  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
  },
  sectionSubtitle: {
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },

  listContent: {
    gap: Spacing.md,
    paddingBottom: 20,
  },

  propertyCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  rippleArea: {
    padding: Spacing.base,
  },
  propertyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  propertyName: {
    fontFamily: "Poppins-SemiBold",
  },
  propertyMeta: {
    fontFamily: "Poppins-Regular",
    flexShrink: 1,
  },

  manageBadge: {
    paddingHorizontal: 10,
    borderWidth: 0,
  },
  manageBadgeText: {
    fontFamily: "Poppins-Bold",
    fontSize: 10,
    textTransform: "uppercase",
  },

  emptyStateCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingVertical: 32,
    paddingHorizontal: Spacing.lg,
    overflow: "hidden",
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
