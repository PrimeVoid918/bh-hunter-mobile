import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Surface,
  TouchableRipple,
  Button,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HStack, VStack, Box } from "@gluestack-ui/themed";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useNavigation } from "@react-navigation/native";

import { Spacing, BorderRadius } from "@/constants";
import { useGetOwnerActiveSubscriptionQuery } from "@/infrastructure/subscriptions/subscriptions.redux.api";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "../navigation/dashboard.types";
import { ActiveSubscription } from "@/infrastructure/subscriptions/subscriptions.schema";

interface SubscriptionSectionComponent {
  data: ActiveSubscription;
}

export default function SubscriptionSectionComponent({
  data,
}: SubscriptionSectionComponent) {
  const theme = useTheme();

  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  const handleNavigation = () => {
    triggerHaptic();

    navigate.navigate("SubscriptionWebviewMainScreen");
  };

  // Helper to calculate days left
  const getDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. ACTIVE STATE
  if (data && data.status === "ACTIVE") {
    const daysLeft = getDaysLeft(data.expiresAt);
    return (
      <Surface
        elevation={0}
        style={[s.container, { borderColor: theme.colors.primary }]}
      >
        <TouchableRipple
          onPress={() => {
            triggerHaptic(); /* navigate to sub settings */
          }}
          style={s.ripple}
        >
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="sm" alignItems="center">
                <Box
                  p={8}
                  borderRadius={10}
                  backgroundColor={theme.colors.primaryContainer}
                >
                  <MaterialCommunityIcons
                    name="credit-card-chip-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                </Box>
                <VStack>
                  <Text
                    variant="labelLarge"
                    style={{
                      color: theme.colors.primary,
                      fontFamily: "Poppins-Bold",
                    }}
                  >
                    YOUR SUBSCRIPTION
                  </Text>
                  <Text variant="titleMedium" style={s.planText}>
                    {data.type} PLAN
                  </Text>
                </VStack>
              </HStack>
              <Box
                backgroundColor={theme.colors.success + "20"}
                px={10}
                py={4}
                borderRadius={20}
              >
                <Text
                  style={{
                    color: theme.colors.success,
                    fontSize: 10,
                    fontFamily: "Poppins-Bold",
                  }}
                >
                  ACTIVE
                </Text>
              </Box>
            </HStack>

            <HStack justifyContent="space-between" style={s.infoRow}>
              <VStack>
                <Text variant="bodySmall" style={s.label}>
                  Expires
                </Text>
                <Text variant="bodyMedium" style={s.value}>
                  {new Date(data.expiresAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </VStack>
              <VStack alignItems="flex-end">
                <Text variant="bodySmall" style={s.label}>
                  Time Left
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    s.value,
                    {
                      color:
                        daysLeft < 5
                          ? theme.colors.error
                          : theme.colors.onSurface,
                    },
                  ]}
                >
                  {daysLeft} Days
                </Text>
              </VStack>
            </HStack>

            <Button
              mode="contained"
              onPress={handleNavigation}
              style={s.actionButton}
              labelStyle={s.buttonLabel}
            >
              Manage Subscription
            </Button>
          </VStack>
        </TouchableRipple>
      </Surface>
    );
  }

  // 2. EXPIRED STATE
  if (data && data.status === "EXPIRED") {
    return (
      <Surface
        elevation={0}
        style={[
          s.container,
          { borderColor: theme.colors.error, backgroundColor: "#FFF5F5" },
        ]}
      >
        <VStack space="sm" p={Spacing.base}>
          <HStack space="md" alignItems="center">
            <MaterialCommunityIcons
              name="alert-decagram"
              size={32}
              color={theme.colors.error}
            />
            <VStack flex={1}>
              <Text
                variant="titleMedium"
                style={{
                  color: theme.colors.error,
                  fontFamily: "Poppins-Bold",
                }}
              >
                Subscription Expired
              </Text>
              <Text variant="bodySmall">
                Your listings are currently hidden from search.
              </Text>
            </VStack>
          </HStack>
          <Button
            mode="contained"
            buttonColor={theme.colors.error}
            onPress={handleNavigation}
            style={s.actionButton}
          >
            Renew Subscription
          </Button>
        </VStack>
      </Surface>
    );
  }

  // 3. NEW USER / NO SUB STATE
  return (
    <Surface
      elevation={0}
      style={[
        s.container,
        { borderStyle: "dashed", backgroundColor: theme.colors.primary + "05" },
      ]}
    >
      <VStack space="md" p={Spacing.base} alignItems="center">
        <MaterialCommunityIcons
          name="rocket-launch-outline"
          size={40}
          color={theme.colors.primary}
        />
        <VStack alignItems="center">
          <Text variant="titleLarge" style={s.promoTitle}>
            Grow your Business
          </Text>
          <Text variant="bodyMedium" style={s.promoSub}>
            Start your 30-day free trial to list your properties in Ormoc City.
          </Text>
        </VStack>
        <HStack space="sm" width="100%">
          {/* <Button
            mode="contained"
            style={[s.actionButton, { flex: 1 }]}
            onPress={triggerHaptic}
          >
            Start Trial
          </Button> */}
          <Button
            mode="outlined"
            style={{ flex: 1, borderRadius: BorderRadius.md }}
            onPress={handleNavigation}
          >
            View Plans
          </Button>
        </HStack>
      </VStack>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginVertical: Spacing.sm,
  },
  ripple: {
    padding: Spacing.base,
  },
  planText: {
    fontFamily: "Poppins-Bold",
    lineHeight: 20,
    marginTop: -2,
  },
  infoRow: {
    backgroundColor: "#F7F9FC",
    padding: 12,
    borderRadius: BorderRadius.md,
  },
  label: {
    fontFamily: "Poppins-Regular",
    color: "#767474",
    fontSize: 11,
  },
  value: {
    fontFamily: "Poppins-SemiBold",
  },
  actionButton: {
    borderRadius: BorderRadius.md,
  },
  buttonLabel: {
    fontFamily: "Poppins-SemiBold",
  },
  promoTitle: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  promoSub: {
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    color: "#767474",
    fontSize: 13,
  },
});
