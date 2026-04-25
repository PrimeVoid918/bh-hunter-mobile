import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import ApiConfig from "@/application/config/api";
import { Spacing } from "@/constants";

export default function BookingAgreementWebviewMainScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingId } = route.params;

  const [loading, setLoading] = useState(true);

  const targetUrl = useMemo(() => {
    const baseUrl = ApiConfig.BASE_URL.replace(/\/+$/, "");
    return `${baseUrl}/api/agreements/bookings/${bookingId}/html`;
  }, [bookingId]);

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
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

        <Appbar.Content title="Digital Agreement" titleStyle={s.headerTitle} />

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
          key={loading ? "loading" : "loaded"}
          source={{ uri: targetUrl }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            Alert.alert(
              "Agreement Unavailable",
              "Unable to load the agreement. Please try again.",
            );
          }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          renderLoading={() => <></>}
        />

        {loading && (
          <View style={[StyleSheet.absoluteFill, s.loaderContainer]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={s.loadingText}>Loading digital agreement...</Text>
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
