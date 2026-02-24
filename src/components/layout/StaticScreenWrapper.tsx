import React from "react";
import {
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FullScreenLoaderAnimated from "../ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "../ui/FullScreenErrorModal";
import { BorderRadius, Spacing } from "@/constants";
import { ActivityIndicator, Modal, Portal, useTheme } from "react-native-paper";

type WrapperVariant = "form" | "list" | "layout" | "none";

interface StaticScreenWrapperInterface {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  wrapInScrollView?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  loading?: boolean | boolean[];
  error?: string | string[];
  empty?: boolean;
  variant?: WrapperVariant;
  /** New prop to toggle the repetitive padding you've been doing manually */
  useStandardPadding?: boolean;
}

export default function StaticScreenWrapper({
  children,
  style,
  contentContainerStyle,
  wrapInScrollView = true,
  refreshing = false,
  onRefresh,
  loading,
  error,
  empty,
  variant = "none",
  useStandardPadding = variant !== "layout",
}: StaticScreenWrapperInterface) {
  const theme = useTheme();
  const isLoading = Array.isArray(loading) ? loading.some(Boolean) : loading;
  const hasError = Array.isArray(error) ? error.filter(Boolean) : error;

  const getStandardPaddingStyle = (): ViewStyle => {
    if (!useStandardPadding) return {};
    return {
      paddingLeft: Spacing.md,
      paddingRight: Spacing.md,
      paddingTop: Spacing.md,
    };
  };

  const getBottomPadding = () => {
    switch (variant) {
      case "form":
        return Spacing.xl * 6;
      case "list":
        return Spacing.xl * 3;
      case "layout":
        return 0;
      default:
        return Spacing.md;
    }
  };

  const renderContent = () => {
    if (isLoading) return <FullScreenLoaderAnimated visible={isLoading} />;

    if (hasError && (hasError as string[]).length > 0)
      return (
        <FullScreenErrorModal
          visible={true}
          message={Array.isArray(hasError) ? hasError.join("\n") : hasError}
        />
      );

    if (empty) return <Text style={styles.emptyText}>No data available</Text>;

    return (
      <>
        {/* BACKDROP REFRESH OVERLAY */}
        <Portal>
          <Modal
            visible={refreshing}
            dismissable={false}
            contentContainerStyle={styles.modalOverlay}
          >
            <View
              style={[
                styles.loaderCard,
                {
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <ActivityIndicator
                animating={true}
                color={theme.colors.primary}
                size="large"
              />
              <Text
                style={[styles.loaderText, { color: theme.colors.onSurface }]}
              >
                Updating Content...
              </Text>
            </View>
          </Modal>
        </Portal>

        {children}

        {variant === "list" && (
          <View style={styles.footerSpacer}>
            <View style={styles.footerDot} />
          </View>
        )}
      </>
    );
  };

  const shouldScroll = variant === "layout" ? false : wrapInScrollView;
  const containerStyle = [styles.container, getStandardPaddingStyle(), style];
  const combinedContentStyle = [
    { paddingBottom: getBottomPadding() },
    contentContainerStyle,
  ];

  const scrollProps = {
    style: containerStyle,
    contentContainerStyle: combinedContentStyle,
    extraScrollHeight: variant === "form" ? 120 : 0,
    enableOnAndroid: true,
    width: "100%",
    height: "100%",
  };

  // 1. Check for Refreshing (Usually implies a list, so keep ScrollView)
  if (onRefresh) {
    return (
      <ScrollView
        {...scrollProps}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    );
  }

  // 2. NEW: If scroll is disabled (like for Maps), return a simple View
  if (!shouldScroll) {
    return <View style={containerStyle}>{renderContent()}</View>;
  }

  // 3. Default to Keyboard Scroll
  return (
    <KeyboardAwareScrollView {...scrollProps}>
      {renderContent()}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)", // Dims the background
    width: "100%",
    height: "100%",
  },
  loaderCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4, // Android depth
    minWidth: 180,
  },
  loaderText: {
    marginTop: 16,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  emptyText: { textAlign: "center", marginTop: Spacing.xl, opacity: 0.5 },
  footerSpacer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
    width: "100%",
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});
