import { View, Text, StyleSheet } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

import {
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
  BorderRadius,
} from "@/constants";
import { HStack, VStack } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeaderComponent from "@/components/layout/ScreenHeaderComponent";
import { Lists } from "@/components/layout/Lists/Lists";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { useGetAllQuery } from "@/infrastructure/notifications/notifications.redux.api";
import { UserRole } from "../../../infrastructure/valid-docs/verification-document/verification-document.schema";
import NotificationCard from "./NotificationCard";
import Container from "@/components/layout/Container/Container";
import { handleNotificationRedirect } from "./notification.screen.routers";

export default function NotificationMainScreen() {
  const {
    id: authUserId,
    role: authUserRole,
    oneQuery,
    patchUser,
    fetchAndSelect,
  } = useDynamicUserApi();

  const {
    data: notifications,
    isError,
    isLoading,
    refetch,
  } = useGetAllQuery({
    role: authUserRole as UserRole,
    userId: authUserId!,
    // resourceType: authUserRole as UserRole,
    page: 1,
    limit: 20,
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const handlePageRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.StaticScreenWrapper]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
    >
      <Container refreshing={refreshing} onRefresh={handlePageRefresh}>
        <ScreenHeaderComponent text={{ textValue: "Notifications" }} />
        <Lists
          list={notifications!}
          renderItem={({ item }) => (
            <NotificationCard
              data={item}
              onPress={(notifData) => handleNotificationRedirect(notifData)}
            />
          )}
          contentContainerStyle={{
            gap: Spacing.base,
          }}
        />
      </Container>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  StaticScreenWrapper: {
    padding: Spacing.md,
  },
});
