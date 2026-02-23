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
    if (!verificationList) return "LOADING";
    const statuses = verificationList.map((d) => d.status);
    const hasMissing = statuses.includes("MISSING");
    const hasRejected = statuses.includes("REJECTED");
    const hasPending = statuses.includes("PENDING");

    if (hasRejected) return "ACTION_REQUIRED";
    if (hasMissing) return "INCOMPLETE";
    if (hasPending) return "UNDER_REVIEW";
    if (verified) return "VERIFIED";
    return "INCOMPLETE";
  }, [verified, verificationList]);

  const statusConfig = {
    VERIFIED: {
      icon: "check-decagram",
      color: "#80CFA9", // Your Success color
      bg: "#F0F9F4",
      title: "Account Verified",
      subtitle: "You have full access to BH-Hunter features.",
    },
    UNDER_REVIEW: {
      icon: "clock-fast",
      color: theme.colors.secondary,
      bg: "#FFFBE6",
      title: "Review in Progress",
      subtitle: "We're checking your documents. Hang tight!",
    },
    ACTION_REQUIRED: {
      icon: "alert-octagon",
      color: theme.colors.error,
      bg: theme.colors.errorContainer,
      title: "Action Required",
      subtitle: "Some documents were rejected. Please re-upload.",
    },
    INCOMPLETE: {
      icon: "file-plus-outline",
      color: theme.colors.outline,
      bg: theme.colors.surfaceVariant,
      title: "Verification Required",
      subtitle: "Upload your ID to start matchmaking in Ormoc.",
    },
    LOADING: { icon: "", color: "", bg: "", title: "", subtitle: "" },
  };

  if (globalStatus === "LOADING") return null;
  const config = statusConfig[globalStatus];

  return (
    <Surface
      elevation={0}
      style={[
        s.container,
        { backgroundColor: config.bg, borderColor: config.color + "40",  },
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
