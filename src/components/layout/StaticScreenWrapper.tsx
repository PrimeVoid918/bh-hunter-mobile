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
import {
  ActivityIndicator,
  Modal,
  Portal,
  useTheme,
  Surface,
  Button,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import FullScreenLoaderAnimated from "../ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "../ui/FullScreenErrorModal";
import { BorderRadius, Spacing } from "@/constants";

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
  useStandardPadding?: boolean;
  lockdown?: boolean;
  onLockdownAction?: () => void;
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
  lockdown = false,
  onLockdownAction,
}: StaticScreenWrapperInterface) {
  const theme = useTheme();

  const isLoading = Array.isArray(loading) ? loading.some(Boolean) : loading;
  const hasError = Array.isArray(error)
    ? error.filter(Boolean).length > 0
    : !!error;
  const errorMessage = Array.isArray(error)
    ? error.filter(Boolean).join("\n")
    : error;

  // --- Helpers ---

  const getBottomPadding = () => {
    switch (variant) {
      case "form":
        return Spacing.xl * 6;
      case "list":
        return Spacing.xl * 3;
      default:
        return Spacing.md;
    }
  };

  const getStandardPaddingStyle = (): ViewStyle => {
    if (!useStandardPadding) return {};
    return { paddingHorizontal: Spacing.md, paddingTop: Spacing.md };
  };

  // --- Render Logic ---

  if (lockdown) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.lockdownContainer}>
          <Surface style={styles.lockdownCard} elevation={0}>
            <MaterialCommunityIcons
              name="shield-lock"
              size={64}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.lockdownTitle, { color: theme.colors.onSurface }]}
            >
              Identity Verification Required
            </Text>
            <Text style={[styles.lockdownSub, { color: theme.colors.outline }]}>
              To ensure the safety of our Ormoc community, you need to be fully
              verified to access this feature.
            </Text>
            <Button
              mode="contained"
              onPress={onLockdownAction}
              style={styles.lockdownBtn}
            >
              Start Verification
            </Button>
          </Surface>
        </View>
      </View>
    );
  }

  if (isLoading) return <FullScreenLoaderAnimated visible={isLoading} />;

  if (hasError)
    return (
      <FullScreenErrorModal visible={true} message={String(errorMessage)} />
    );

  if (empty)
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );

  const renderMainContent = () => (
    <>
      <Portal>
        <Modal
          visible={refreshing}
          dismissable={false}
          contentContainerStyle={styles.modalOverlay}
        >
          <Surface style={styles.loaderCard} elevation={2}>
            <ActivityIndicator
              animating={true}
              color={theme.colors.primary}
              size="large"
            />
            <Text
              style={[styles.loaderText, { color: theme.colors.onSurface }]}
            >
              Updating...
            </Text>
          </Surface>
        </Modal>
      </Portal>

      {children}

      {/* THE GOOGLE/YOUTUBE "END OF LIST" SPACER */}
      {variant === "list" && (
        <View style={styles.footerSpacer}>
          <View
            style={[
              styles.footerDot,
              { backgroundColor: theme.colors.outlineVariant },
            ]}
          />
        </View>
      )}
    </>
  );

  const containerStyle = [styles.container, getStandardPaddingStyle(), style];
  const combinedContentStyle = [
    { flexGrow: 1, paddingBottom: getBottomPadding() },
    contentContainerStyle,
  ];

  const shouldScroll = variant !== "layout" && wrapInScrollView;

  if (onRefresh) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={combinedContentStyle}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderMainContent()}
      </ScrollView>
    );
  }

  if (!shouldScroll) {
    return <View style={containerStyle}>{renderMainContent()}</View>;
  }

  return (
    <KeyboardAwareScrollView
      style={containerStyle}
      contentContainerStyle={combinedContentStyle}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
    >
      {renderMainContent()}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  lockdownContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  lockdownCard: {
    width: "100%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  lockdownTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  lockdownSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  lockdownBtn: { width: "100%", borderRadius: BorderRadius.md },
  modalOverlay: { justifyContent: "center", alignItems: "center", padding: 20 },
  loaderCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 180,
    backgroundColor: "white",
  },
  loaderText: { marginTop: 16, fontFamily: "Poppins-Medium", fontSize: 14 },
  emptyText: { textAlign: "center", marginTop: Spacing.xl, opacity: 0.5 },
  // Footer Spacer Styles
  footerSpacer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.5,
  },
});
