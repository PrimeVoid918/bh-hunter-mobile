import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import {
  Text,
  Button,
  Checkbox,
  Surface,
  TouchableRipple,
  ActivityIndicator,
  useTheme,
  Divider,
} from "react-native-paper";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import { useGetUserLegitimacyConsentPoliciesQuery } from "@/infrastructure/policies/policies.redux.api";

interface LegitmacyContsentComponentProps {
  role: "owner" | "tenant";
  value: boolean;
  onChange: (val: boolean) => void;
}

export default function LegitmacyContsentComponent({
  role,
  onChange,
  value,
}: LegitmacyContsentComponentProps) {
  const theme = useTheme();
  const [termsModal, setTermsModal] = useState(false);

  const {
    data: consentHtml,
    isFetching,
    isError,
  } = useGetUserLegitimacyConsentPoliciesQuery({
    type: role,
  });

  const handleToggleOpen = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setTermsModal(true);
  };

  const handleAction = (accepted: boolean) => {
    ReactNativeHapticFeedback.trigger(
      accepted ? "notificationSuccess" : "impactMedium",
    );
    onChange(accepted);
    setTermsModal(false);
  };

  const htmlSource = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body { 
            font-family: 'Poppins', sans-serif; 
            padding: 15px; 
            color: ${theme.colors.onSurface};
            line-height: 1.6;
            background-color: transparent;
          }
          h1 { color: ${theme.colors.primary}; font-size: 20px; font-weight: 700; }
          h2 { color: ${theme.colors.onSurface}; font-size: 17px; margin-top: 20px; font-weight: 600; }
          p { font-size: 14px; margin-bottom: 12px; color: ${theme.colors.onSurfaceVariant}; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid ${theme.colors.outlineVariant}; }
          th, td { border: 1px solid ${theme.colors.outlineVariant}; padding: 10px; font-size: 12px; text-align: left; }
          th { background-color: ${theme.colors.surfaceVariant}; font-weight: 700; }
        </style>
      </head>
      <body>${consentHtml || ""}</body>
    </html>
  `;

  return (
    <View style={s.container}>
      <Surface
        style={[
          s.checkboxSurface,
          { borderColor: theme.colors.outlineVariant },
        ]}
        elevation={0}
      >
        <TouchableRipple onPress={handleToggleOpen} style={s.ripple}>
          <View style={s.row}>
            <Checkbox.Android
              status={value ? "checked" : "unchecked"}
              onPress={handleToggleOpen}
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" style={s.label}>
              Accept{" "}
              <Text
                style={{
                  color: theme.colors.primary,
                  fontFamily: "Poppins-Bold",
                }}
              >
                {role === "owner" ? "Owner" : "Tenant"} Legitimacy Consent
              </Text>
            </Text>
          </View>
        </TouchableRipple>
      </Surface>

      <Modal
        visible={termsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setTermsModal(false)}
      >
        <View style={s.modalOverlay}>
          <Surface
            style={[
              s.modalContent,
              { borderColor: theme.colors.outlineVariant },
            ]}
            elevation={5}
          >
            <View style={s.modalHeader}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge" style={s.title}>
                Legitimacy Policy
              </Text>
            </View>

            <Divider />

            <View style={s.webViewWrapper}>
              {isFetching ? (
                <View style={s.center}>
                  <ActivityIndicator color={theme.colors.primary} />
                  <Text variant="bodySmall" style={{ marginTop: 10 }}>
                    Loading Legal Documents...
                  </Text>
                </View>
              ) : isError ? (
                <View style={s.center}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={40}
                    color={theme.colors.error}
                  />
                  <Text style={{ color: theme.colors.error, marginTop: 10 }}>
                    Connection Error
                  </Text>
                </View>
              ) : (
                <WebView
                  originWhitelist={["*"]}
                  source={{ html: htmlSource }}
                  style={s.webview}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            <Divider />

            <View style={s.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => handleAction(false)}
                style={s.flexButton}
              >
                Decline
              </Button>
              <Button
                mode="contained"
                onPress={() => handleAction(true)}
                style={s.flexButton}
                disabled={isFetching}
              >
                I Accept
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginVertical: 8 },
  checkboxSurface: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  ripple: { paddingVertical: 14, paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center" },
  label: { flex: 1, marginLeft: 10, fontFamily: "Poppins-Medium" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "92%",
    height: "75%",
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  title: { fontFamily: "Poppins-Bold" },
  webViewWrapper: {
    flex: 1,
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: { flex: 1, backgroundColor: "transparent" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonContainer: { flexDirection: "row", gap: 12, marginTop: 15 },
  flexButton: { flex: 1, borderRadius: 8 },
});
