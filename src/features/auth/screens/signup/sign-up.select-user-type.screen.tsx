import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Text, Surface, TouchableRipple, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SignUpStackParamList } from "./navigation/sign-up.stack.types";

export default function SignUpSelectUserTypeScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<SignUpStackParamList>>();

  const handleSelection = (type: "SignUpOwner" | "SignUpTenant") => {
    ReactNativeHapticFeedback.trigger("impactMedium");
    navigation.navigate(type);
  };

  return (
    <StaticScreenWrapper style={{ backgroundColor: theme.colors.background }}>
      <View style={s.container}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={s.header}
        >
          <Text variant="displaySmall" style={s.title}>
            Get Started
          </Text>
          <Text variant="titleMedium" style={s.subtitle}>
            Choose your role to continue your journey in Ormoc City
          </Text>
        </MotiView>

        <View style={s.cardContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 200 }}
          >
            <Surface
              style={[s.card, { borderColor: theme.colors.outlineVariant }]}
              elevation={0}
            >
              <TouchableRipple
                onPress={() => handleSelection("SignUpOwner")}
                rippleColor="rgba(53, 127, 193, 0.1)"
                style={s.ripple}
              >
                <View style={s.cardInner}>
                  <View
                    style={[
                      s.iconCircle,
                      { backgroundColor: theme.colors.primaryContainer },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="office-building-marker"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={s.textGroup}>
                    <Text variant="headlineSmall" style={s.cardTitle}>
                      Boarding House Owner
                    </Text>
                    <Text variant="bodyMedium" style={s.cardDescription}>
                      I want to list my rooms, manage tenants, and track
                      payments.
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={theme.colors.outline}
                  />
                </View>
              </TouchableRipple>
            </Surface>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 400 }}
          >
            <Surface
              style={[s.card, { borderColor: theme.colors.outlineVariant }]}
              elevation={0}
            >
              <TouchableRipple
                onPress={() => handleSelection("SignUpTenant")}
                rippleColor="rgba(53, 127, 193, 0.1)"
                style={s.ripple}
              >
                <View style={s.cardInner}>
                  <View
                    style={[
                      s.iconCircle,
                      { backgroundColor: theme.colors.secondaryContainer },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="home-search-outline"
                      size={32}
                      color={theme.colors.onSecondaryContainer}
                    />
                  </View>
                  <View style={s.textGroup}>
                    <Text variant="headlineSmall" style={s.cardTitle}>
                      Looking for a Room
                    </Text>
                    <Text variant="bodyMedium" style={s.cardDescription}>
                      I want to find, book, and stay in the best boarding
                      houses.
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={theme.colors.outline}
                  />
                </View>
              </TouchableRipple>
            </Surface>
          </MotiView>
        </View>

        <Text variant="bodySmall" style={s.footerText}>
          By continuing, you agree to our Terms of Service.
        </Text>
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontFamily: "Poppins-Medium",
    color: "#767474",
    marginTop: 8,
    lineHeight: 24,
  },
  cardContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  ripple: {
    padding: 24,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  textGroup: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: "Poppins-Regular",
    color: "#767474",
    lineHeight: 20,
  },
  footerText: {
    textAlign: "center",
    marginTop: 40,
    color: "#CCCCCC",
    fontFamily: "Poppins-Regular",
  },
});
