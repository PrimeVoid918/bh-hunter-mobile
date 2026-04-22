import React, { useState, useMemo } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { Appbar, ActivityIndicator, useTheme, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import ApiConfig from "@/application/config/api";
import { Spacing } from "@/constants";

export default function SubscriptionWebviewMainScreen() {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigation = useNavigation<any>();

  // Determine the target URL
  // If Dev: http://192.168.x.x:5173/pricing
  // If Prod: https://bhhph.online/pricing
  const targetUrl = useMemo(() => {
    // We replace the backend port with the Vite port for the frontend website
    const base =
      ApiConfig.BASE_URL.split(":")[0] + ":" + ApiConfig.BASE_URL.split(":")[1];
    const isDev =
      ApiConfig.BASE_URL.includes("localhost") ||
      ApiConfig.BASE_URL.includes("192.168");

    return isDev ? `${base}:5173/pricing` : `https://bhhph.online/pricing`;
  }, []);

  console.log("api url: ", targetUrl);

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Intercept the redirect back to the app
    if (url.startsWith("bhhunter://")) {
      triggerHaptic();
      if (url.includes("success")) {
        Alert.alert("Awesome!", "Your subscription is being processed.");
      }
      navigation.navigate("DashboardMain");
    }
  };

  return (
    <View style={s.container}>
      <Appbar.Header elevated style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction
          onPress={() => {
            triggerHaptic();
            navigation.goBack();
          }}
        />
        <Appbar.Content title="Subscription Plans" titleStyle={s.headerTitle} />
        <Appbar.Action
          icon="refresh"
          onPress={() => {
            triggerHaptic();
            setLoading(true);
          }}
        />
      </Appbar.Header>

      <View style={s.webviewContainer}>
        <WebView
          source={{ uri: targetUrl }}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState
          javaScriptEnabled={true}
          domStorageEnabled={true}
          // Optimization for Android Dev Builds
          setSupportMultipleWindows={false}
          renderLoading={() => <></>}
        />

        {loading && (
          <View style={[StyleSheet.absoluteFill, s.loaderContainer]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={s.loadingText}>Connecting to BH-Hunter Web...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  webviewContainer: {
    flex: 1,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    gap: Spacing.md,
  },
  loadingText: {
    fontFamily: "Poppins-Medium",
    color: "#767474",
    fontSize: 14,
  },
});
