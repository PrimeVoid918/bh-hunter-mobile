import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, IconButton, useTheme, Chip, Surface } from "react-native-paper";
import { HStack, VStack } from "@gluestack-ui/themed";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Lists } from "@/components/layout/Lists/Lists";
import { Spacing, GlobalStyle, BorderRadius } from "@/constants";

// Infrastructure
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { useGetAllQuery } from "@/infrastructure/notifications/notifications.redux.api";
import { UserRole } from "../../../infrastructure/valid-docs/verification-document/verification-document.schema";
import NotificationCard from "./NotificationCard";
import { handleNotificationRedirect } from "./notification.screen.routers";

export default function NotificationMainScreen() {
  const theme = useTheme();
  const { id: authUserId, role: authUserRole } = useDynamicUserApi();
  const [activeFilter, setActiveFilter] = React.useState("All");

  const {
    data: notifications,
    isError,
    isLoading,
    refetch,
  } = useGetAllQuery({
    role: authUserRole as UserRole,
    userId: authUserId!,
    page: 1,
    limit: 20,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const handlePageRefresh = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const handleArchiveAll = () => {
    ReactNativeHapticFeedback.trigger("notificationSuccess");
    // Functionality for later
    console.log("Archive all triggered");
  };

  return (
    <StaticScreenWrapper
      variant="list"
      style={{ backgroundColor: theme.colors.background }}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isLoading}
      error={[isError ? "Failed to load" : null]}
    >
      <View style={s.mainContainer}>
        <HStack style={s.headerRow}>
          <VStack>
            <Text variant="displaySmall" style={s.pageTitle}>
              Notifications
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              You have {notifications?.length || 0} updates
            </Text>
          </VStack>
          <IconButton
            icon="archive-arrow-down-outline"
            mode="contained-tonal"
            iconColor={theme.colors.primary}
            size={24}
            onPress={handleArchiveAll}
          />
        </HStack>

        <HStack style={s.filterContainer} space="sm">
          {["All", "Unread", "Important"].map((filter) => (
            <Chip
              key={filter}
              selected={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                s.chip,
                activeFilter === filter && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              textStyle={s.chipText}
              showSelectedCheck={false}
            >
              {filter}
            </Chip>
          ))}
        </HStack>

        <Lists
          list={notifications!}
          renderItem={({ item }) => (
            <NotificationCard
              data={item}
              onPress={(notifData) => {
                ReactNativeHapticFeedback.trigger("impactLight");
                handleNotificationRedirect(notifData);
              }}
            />
          )}
          contentContainerStyle={s.listPadding}
          ListEmptyComponent={
            <VStack style={s.emptyState} space="md">
              <Surface style={s.emptyIconBg} elevation={0}>
                <IconButton
                  icon="bell-off-outline"
                  size={40}
                  iconColor={theme.colors.outlineVariant}
                />
              </Surface>
              <Text variant="titleMedium" style={s.emptyText}>
                All caught up!
              </Text>
              <Text variant="bodySmall" style={s.emptySubText}>
                We'll notify you when something important happens.
              </Text>
            </VStack>
          }
        />
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainContainer: { paddingTop: 10 },
  headerRow: {
    justifyContent: "space-between",
    alignItems: "center",
    // paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  pageTitle: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  filterContainer: {
    // paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  chip: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  listPadding: {
    // paddingHorizontal: Spacing.base,
    paddingBottom: 80,
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Poppins-SemiBold",
    color: "#1A1A1A",
  },
  emptySubText: {
    fontFamily: "Poppins-Regular",
    color: "#767474",
    textAlign: "center",
  },
});
