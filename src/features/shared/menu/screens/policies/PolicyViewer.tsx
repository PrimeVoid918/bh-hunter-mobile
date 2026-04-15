import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, useTheme, Text } from "react-native-paper";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

import {
  useGetTermsQuery,
  useGetPrivacyQuery,
  useGetRefundPoliciesQuery,
  useGetUserLegitimacyConsentPoliciesQuery,
} from "@/infrastructure/policies/policies.redux.api";

export default function PolicyViewerScreen({ route }: any) {
  const { type, subType } = route.params;
  const theme = useTheme();

  const queries = {
    terms: useGetTermsQuery(undefined, { skip: type !== "terms" }),
    privacy: useGetPrivacyQuery(undefined, { skip: type !== "privacy" }),
    refund: useGetRefundPoliciesQuery(
      { type: subType },
      { skip: type !== "refund" },
    ),
    consent: useGetUserLegitimacyConsentPoliciesQuery(
      { type: subType },
      { skip: type !== "consent" },
    ),
  };

  const currentQuery = queries[type as keyof typeof queries];
  const contentHtml = currentQuery?.data;
  const isLoading = currentQuery?.isFetching;
  const isError = currentQuery?.isError;

  const htmlSource = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body { 
            font-family: 'Poppins', sans-serif; 
            padding: 20px; 
            color: ${theme.colors.onSurface};
            line-height: 1.6;
            background-color: transparent;
          }
          h1 { color: ${theme.colors.primary}; font-size: 22px; font-weight: 700; margin-bottom: 16px; }
          h2 { color: ${theme.colors.onSurface}; font-size: 18px; margin-top: 24px; font-weight: 600; }
          p { font-size: 14px; margin-bottom: 12px; color: ${theme.colors.onSurfaceVariant}; }
          ul, ol { margin-bottom: 12px; padding-left: 20px; }
          li { font-size: 14px; margin-bottom: 6px; color: ${theme.colors.onSurfaceVariant}; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid ${theme.colors.outlineVariant}; }
          th, td { border: 1px solid ${theme.colors.outlineVariant}; padding: 10px; font-size: 12px; text-align: left; }
          th { background-color: ${theme.colors.surfaceVariant}; font-weight: 700; }
        </style>
      </head>
      <body>${contentHtml || ""}</body>
    </html>
  `;

  return (
    <StaticScreenWrapper style={{ backgroundColor: theme.colors.background }}>
      <View style={s.container}>
        {isLoading ? (
          <View style={s.center}>
            <ActivityIndicator
              animating={true}
              color={theme.colors.primary}
              size="large"
            />
            <Text variant="bodySmall" style={{ marginTop: 12 }}>
              Fetching Document...
            </Text>
          </View>
        ) : isError ? (
          <View style={s.center}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={48}
              color={theme.colors.error}
            />
            <Text
              style={{
                color: theme.colors.error,
                marginTop: 12,
                fontFamily: "Poppins-Medium",
              }}
            >
              Failed to load policy.
            </Text>
          </View>
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlSource }}
            style={s.webview}
            showsVerticalScrollIndicator={false}
            domStorageEnabled={true}
            javaScriptEnabled={true}
          />
        )}
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
