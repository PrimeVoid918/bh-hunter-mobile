import React, { useState } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Text, useTheme, Surface, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { VStack, HStack, Badge, BadgeText } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Spacing, BorderRadius } from "@/constants";
import { useGetAllQuery as useGetAllBoardingHouses } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { RootState } from "@/application/store/stores";
import { OwnerTabsParamList } from "../../navigation/owner.tabs.type";
import { Lists } from "@/components/layout/Lists/Lists";

export default function PropertiesMainScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<BottomTabNavigationProp<OwnerTabsParamList>>();

  const ownerId = useSelector(
    (state: RootState) => state.owners.selectedUser?.id,
  );
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: boardinghouses,
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
    navigation.navigate("Booking", {
      screen: "PropertiesBookingListsScreen",
      params: { bhId: id },
    });
  };

  return (
    <StaticScreenWrapper
      variant="list"
      style={{ backgroundColor: colors.background }}
      loading={isLoading}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
    >
      <View style={s.mainContainer}>
        {/* --- TITLE SECTION --- */}
        <VStack style={s.headerSection}>
          <Text variant="displaySmall" style={s.title}>
            Select Property
          </Text>
          <Text variant="bodyMedium" style={s.subtitle}>
            Choose a boarding house to manage its bookings.
          </Text>
        </VStack>

        {/* --- LIST SECTION --- */}
        {boardinghouses && (
          <Lists
            list={boardinghouses}
            contentContainerStyle={s.listPadding}
            renderItem={({ item }) => (
              <Surface
                elevation={0}
                style={[s.navCard, { borderColor: colors.outlineVariant }]}
              >
                <Pressable
                  android_ripple={{ color: "rgba(0,0,0,0.05)" }}
                  onPress={() => handleNavigate(item.id)}
                  style={s.pressableArea}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack flex={1} gap={Spacing.md} alignItems="center">
                      {/* Visual Anchor */}
                      <Surface
                        style={[
                          s.iconContainer,
                          { backgroundColor: colors.primaryContainer },
                        ]}
                        elevation={0}
                      >
                        <MaterialCommunityIcons
                          name="office-building-marker"
                          size={24}
                          color={colors.primary}
                        />
                      </Surface>

                      <VStack flex={1}>
                        <Text
                          variant="titleMedium"
                          style={s.bhName}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <HStack gap={Spacing.xs} alignItems="center">
                          <MaterialCommunityIcons
                            name="door-open"
                            size={14}
                            color={colors.outline}
                          />
                          <Text variant="bodySmall" style={s.metaText}>
                            {item.rooms?.length || 0} Rooms
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>

                    <HStack alignItems="center" gap={Spacing.sm}>
                      <Badge
                        size="md"
                        variant="solid"
                        borderRadius="$full"
                        style={s.badge}
                      >
                        <BadgeText style={s.badgeText}>Action</BadgeText>
                      </Badge>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={22}
                        color={colors.outlineVariant}
                      />
                    </HStack>
                  </HStack>
                </Pressable>
              </Surface>
            )}
          />
        )}
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainContainer: {},
  headerSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    color: "#767474",
    marginTop: -4,
  },
  listPadding: {
    paddingBottom: 40,
    gap: Spacing.md,
  },
  navCard: {
    borderRadius: BorderRadius.xl, // MD3 Contained Card
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  pressableArea: {
    padding: Spacing.base,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bhName: {
    fontFamily: "Poppins-SemiBold",
    color: "#1A1A1A",
  },
  metaText: {
    fontFamily: "Poppins-Regular",
    color: "#767474",
  },
  badge: {
    paddingHorizontal: 8,
    backgroundColor: "#FDD85D", // Secondary yellow
    borderWidth: 0,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Poppins-Bold",
    color: "#3A3A3A",
    textTransform: "uppercase",
  },
});
