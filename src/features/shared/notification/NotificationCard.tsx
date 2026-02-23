import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Surface, useTheme } from "react-native-paper";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import { HStack, VStack } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import {
  GetNotification,
  NotificationType,
} from "@/infrastructure/notifications/notifications.schema";
import { getRelativeTime } from "@/infrastructure/utils/date-and-time/relative-time.util";
import { Pressable } from "react-native-gesture-handler";
import { notificationConfig } from "./notification-card.config";

interface NotificationCardInterface {
  data: GetNotification;
  onPress?: (data: GetNotification) => void;
}
export default function NotificationCard({
  data,
  onPress,
}: NotificationCardInterface) {
  const theme = useTheme();

  const meta = notificationConfig[data.type as NotificationType] ?? {
    label: "Notification",
    color: theme.colors.primary,
    description: data.message || "New update available",
    icon: "notifications-outline",
  };

  const isRead = data.readAt !== null;

  // Force the background color logic here
  const backgroundColor = isRead
    ? theme.colors.surface
    : theme.colors.primaryContainer + "30"; // Slightly more visible unread tint

  return (
    <Pressable onPress={() => onPress?.(data)} style={s.pressable}>
      <Surface
        mode="flat" // CRITICAL: Removes automatic elevation tinting
        style={[
          s.surface,
          { backgroundColor }, // Apply background directly to Surface
        ]}
      >
        <HStack alignItems="flex-start" style={s.container}>
          <View
            style={[s.iconContainer, { backgroundColor: meta.color + "15" }]}
          >
            <Ionicons name={meta.icon as any} size={22} color={meta.color} />
          </View>

          <VStack style={s.text_container}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text style={[s.title, { color: theme.colors.onSurface }]}>
                {meta.label}
              </Text>
              {!isRead && (
                <View
                  style={[
                    s.unreadDot,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              )}
            </HStack>

            <Text
              numberOfLines={2}
              style={[s.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {data.message || meta.description}
            </Text>

            <Text style={s.timeText}>{getRelativeTime(data.createdAt)}</Text>
          </VStack>
        </HStack>
      </Surface>
    </Pressable>
  );
}

const s = StyleSheet.create({
  pressable: {
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  surface: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  container: {
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  text_container: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: "700",
    fontSize: Fontsize.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 4,
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
