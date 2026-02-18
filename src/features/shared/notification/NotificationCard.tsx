import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Surface } from "react-native-paper";
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
  const meta = notificationConfig[data.type as NotificationType] ?? {
    label: "Unknown Notification",
    color: "#94A3B8",
    description: data.message || "No description",
    icon: "notification",
  };

  return (
    <Pressable onPress={() => onPress?.(data)}>
      <Surface style={s.surface} elevation={1}>
        <HStack alignItems="center" style={[s.container]}>
          <Ionicons
            name={meta.icon}
            size={Fontsize.display2}
            color={meta.color}
            // color={Colors.PrimaryLight[4]}
          />
          <VStack style={[s.text_container]}>
            <Text style={[s.title]}>{meta.label}</Text>
            <Text style={{}}>{meta.description}</Text>
            {/* <Text style={{}}>{data.message || meta.description}</Text> */}
            <Text style={{ fontSize: 12, opacity: 0.6 }}>
              {getRelativeTime(data.createdAt)}
            </Text>
          </VStack>
        </HStack>
      </Surface>
    </Pressable>
  );
}
const s = StyleSheet.create({
  surface: {
    padding: Spacing.sm,
    minHeight: 80,
    width: "100%",
    justifyContent: "center",
    backgroundColor: Colors.whiteToBlack[2],
    borderRadius: BorderRadius.md,
  },

  container: { gap: Spacing.sm },

  text_container: {
    flex: 1, // <-- makes it take remaining space
    flexShrink: 1,
  },

  title: {
    fontWeight: "900",
    fontSize: Fontsize.lg,
  },
});
