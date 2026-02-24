import React, { useMemo } from "react";
import { View, StyleSheet, Image } from "react-native";
import {
  Text,
  Surface,
  IconButton,
  FAB,
  useTheme,
  TouchableRipple,
  Divider,
} from "react-native-paper";
import { VStack, HStack, Badge, BadgeText, Box } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Spacing, BorderRadius } from "@/constants";
import { OwnerDashboardStackParamList } from "../navigation/dashboard.types";
import { useGetAllQuery as useGetAllRoomsQuery } from "@/infrastructure/room/rooms.redux.api";
import { Lists } from "@/components/layout/Lists/Lists";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

export default function RoomsListMainScreen({ route }) {
  const { colors } = useTheme();
  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();
  const paramsId = route.params.paramsId;

  const {
    data: roomsData,
    isLoading,
    isError,
    refetch,
  } = useGetAllRoomsQuery(paramsId);
  const rooms = useMemo(() => roomsData ?? [], [roomsData]);

  const handleAddRoom = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    navigate.navigate("RoomsAddScreen", { bhId: paramsId });
  };
  const [refreshing, setRefreshing] = React.useState(false);

  const renderRoomCard = ({ item }: { item: any }) => {
    const thumbnailUrl = item.thumbnail?.[0]?.url || null;

    return (
      <Surface elevation={0} style={s.roomCard}>
        <TouchableRipple
          onPress={() =>
            navigate.navigate("RoomsDetailsScreen", {
              roomId: item.id,
              boardingHouseId: item.boardingHouseId,
            })
          }
          rippleColor="rgba(53, 127, 193, 0.1)"
        >
          <VStack>
            <HStack p={Spacing.sm} gap={Spacing.md} alignItems="center">
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
                      name="image-off-outline"
                      size={20}
                      color={colors.outline}
                    />
                  </Box>
                )}
              </Box>

              <VStack flex={1} gap={2}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text variant="titleMedium" style={s.roomNumber}>
                    Room {item.roomNumber}
                  </Text>
                  <Text variant="labelLarge" style={{ color: colors.primary }}>
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

                <HStack gap={Spacing.sm} mt={4}>
                  <Badge
                    action={item.availabilityStatus ? "success" : "error"}
                    variant="solid"
                    borderRadius="$full"
                    size="sm"
                  >
                    <BadgeText style={s.badgeText}>
                      {item.availabilityStatus ? "Available" : "Not Available"}
                    </BadgeText>
                  </Badge>
                  <HStack alignItems="center" gap={4}>
                    <MaterialCommunityIcons
                      name="account-group-outline"
                      size={14}
                      color={colors.outline}
                    />
                    <Text
                      variant="labelSmall"
                      style={{ color: colors.outline }}
                    >
                      {item.maxCapacity}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>

            <Divider style={s.divider} />

            <HStack
              px={Spacing.md}
              py={8}
              justifyContent="space-between"
              alignItems="center"
              style={s.cardFooter}
            >
              <Text variant="labelSmall" style={{ color: colors.outline }}>
                Last updated: {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.outlineVariant}
              />
            </HStack>
          </VStack>
        </TouchableRipple>
      </Surface>
    );
  };

  const handlePageRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <StaticScreenWrapper
        variant="list"
        refreshing={refreshing}
        onRefresh={handlePageRefresh}
        loading={isLoading}
        error={[isError ? "" : null]}
      >
        <VStack p={Spacing.md} gap={Spacing.md}>
          <VStack>
            <Text variant="headlineSmall" style={s.headerText}>
              Room Inventory
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.outline }}>
              Manage occupancy and pricing for this property.
            </Text>
          </VStack>

          <Lists
            list={rooms}
            contentContainerStyle={s.listContent}
            renderItem={renderRoomCard}
          />
        </VStack>
      </StaticScreenWrapper>
      <FAB
        icon="plus"
        label="New Room"
        style={[
          s.fab,
          {
            backgroundColor: colors.primary,
            borderRadius: BorderRadius.md,
          },
        ]}
        onPress={() => navigate.navigate("RoomsAddScreen", { bhId: paramsId })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  headerText: { fontFamily: "Poppins-Bold", letterSpacing: -0.5 },
  listContent: { paddingBottom: 100, gap: Spacing.md },
  roomCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  imageWrapper: {
    width: 70,
    height: 70,
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
  roomNumber: { fontFamily: "Poppins-SemiBold" },
  badgeText: {
    fontSize: 9,
    fontFamily: "Poppins-Bold",
    textTransform: "uppercase",
  },
  divider: { backgroundColor: "#F0F0F5", height: 1 },
  cardFooter: { backgroundColor: "#FAFAFB" },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.xl,
  },
});
