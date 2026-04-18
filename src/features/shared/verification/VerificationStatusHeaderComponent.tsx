import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface, Button, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BorderRadius, Spacing } from "@/constants";
import {
  VerificationStatus,
  VerificationDocumentMetaData,
} from "@/infrastructure/valid-docs/verification-document/verification-document.schema";

export type GlobalVerificationStatus =
  | "VERIFIED"
  | "UNDER_REVIEW"
  | "ACTION_REQUIRED"
  | "INCOMPLETE"
  | "LOADING";

interface VerificationListItem {
  status: VerificationStatus;
  document: VerificationDocumentMetaData | null;
}

interface Props {
  verified?: boolean;
  verificationList: VerificationListItem[];
  onCompleteProfile?: () => void;
}

export default function VerificationStatusHeader({
  verified,
  verificationList,
  onCompleteProfile,
}: Props) {
  const theme = useTheme();

  const globalStatus: GlobalVerificationStatus = React.useMemo(() => {
    if (!verificationList || verificationList.length === 0) return "INCOMPLETE";

    const statuses = verificationList.map((d) => d.status);

    const hasRejected = statuses.includes("REJECTED");
    const hasExpired = statuses.includes("EXPIRED");
    const hasPending = statuses.includes("PENDING");
    // "MISSING" comes from your .map logic in the MainScreen
    const hasMissing = statuses.includes("MISSING" as any);

    // 1. If anything is rejected or expired, it's urgent
    if (hasRejected || hasExpired) return "ACTION_REQUIRED";

    // 2. If nothing is rejected but something is missing
    if (hasMissing) return "INCOMPLETE";

    // 3. If everything is uploaded but one is still being checked
    if (hasPending) return "UNDER_REVIEW";

    // 4. Finally, check the verified flag from the API
    if (verified) return "VERIFIED";

    return "INCOMPLETE";
  }, [verified, verificationList]);

  const statusConfig = {
    VERIFIED: {
      icon: "shield-check",
      color: "#80CFA9",
      bg: "#F0F9F4",
      title: "Account Verified",
      subtitle: "You have full access to BH-Hunter features in Ormoc City.",
    },
    UNDER_REVIEW: {
      icon: "clock-fast",
      color: "#FBBC05", // Yellow
      bg: "#FFFBE6",
      title: "Review in Progress",
      subtitle: "The admin is checking your documents. Hang tight!",
    },
    ACTION_REQUIRED: {
      icon: "alert-octagon",
      color: theme.colors.error,
      bg: theme.colors.errorContainer,
      title: "Action Required",
      subtitle: "Update rejected or expired documents to keep your status.",
    },
    INCOMPLETE: {
      icon: "file-plus-outline",
      color: theme.colors.outline,
      bg: theme.colors.surfaceVariant,
      title: "Verification Required",
      subtitle: "Upload the required documents to start matchmaking.",
    },
    LOADING: {
      icon: "refresh",
      color: "#ccc",
      bg: "#eee",
      title: "Loading...",
      subtitle: "Fetching status...",
    },
  };

  const config = statusConfig[globalStatus];

  return (
    <Surface
      elevation={0}
      style={[
        s.container,
        { backgroundColor: config.bg, borderColor: config.color + "40" },
      ]}
    >
      <View style={[s.iconCircle, { backgroundColor: config.color + "20" }]}>
        <MaterialCommunityIcons
          name={config.icon as any}
          color={config.color}
          size={42}
        />
      </View>

      <Text
        variant="headlineSmall"
        style={[s.title, { color: theme.colors.onSurface }]}
      >
        {config.title}
      </Text>

      <Text
        variant="bodyMedium"
        style={[s.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {config.subtitle}
      </Text>

      {/* Show complete profile only if they are just starting out */}
      {globalStatus === "INCOMPLETE" && onCompleteProfile && (
        <Button
          mode="contained-tonal"
          onPress={onCompleteProfile}
          style={s.button}
          labelStyle={s.buttonLabel}
          icon="account-edit-outline"
        >
          Complete Profile
        </Button>
      )}
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
    borderRadius: BorderRadius.md, // MD3 Large radius
    borderWidth: 1,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
});
