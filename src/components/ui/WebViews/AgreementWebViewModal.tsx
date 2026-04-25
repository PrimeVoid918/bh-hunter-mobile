import React, { useMemo, useState } from "react";
import { Alert, Modal, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import ApiConfig from "@/application/config/api";
import { Spacing } from "@/constants";

type Props = {
  visible: boolean;
  bookingId: number;
  onClose: () => void;
};

export default function AgreementWebViewModal({
  visible,
  bookingId,
  onClose,
}: Props) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  const targetUrl = useMemo(() => {
    const baseUrl = ApiConfig.BASE_URL.replace(/\/+$/, "");

    if (baseUrl.endsWith("/api")) {
      return `${baseUrl}/agreements/bookings/${bookingId}/html`;
    }
    console.log("Agreement WebView URL:", bookingId);

    return `${baseUrl}/api/agreements/bookings/${bookingId}/html`;
  }, [bookingId]);

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <Appbar.Header
          elevated
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Appbar.BackAction
            onPress={() => {
              triggerHaptic();
              onClose();
            }}
          />

          <Appbar.Content
            title="Digital Agreement"
            titleStyle={s.headerTitle}
          />

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
            key={`${bookingId}-${loading ? "loading" : "loaded"}`}
            source={{ uri: targetUrl }}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              Alert.alert(
                "Agreement Unavailable",
                "Unable to load the saved agreement. Please try again.",
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
    </Modal>
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
