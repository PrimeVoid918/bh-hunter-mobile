import { View, Pressable, StyleSheet } from "react-native";
import React from "react";
import { GetBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import { Lists } from "@/components/layout/Lists/Lists";
import { Badge, Surface, Text, useTheme } from "react-native-paper";
import { BadgeText, HStack, VStack } from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Spacing } from "@/constants";

interface BookingList {
  boardingHouses: GetBoardingHouse[];
  handleNavigate: (item: number) => void;
}

export default function BookingList({
  boardingHouses,
  handleNavigate,
}: BookingList) {
  const { colors } = useTheme();
  return (
    <Lists
      list={boardingHouses}
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
  );
}

const s = StyleSheet.create({});
