import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Button } from "@gluestack-ui/themed";
import { Spacing } from "@/constants";
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

const statusConfig = {
  VERIFIED: {
    icon: "checkmark-circle",
    color: "#34A853",
    title: "Fully Verified",
    subtitle: "Your account is fully verified.",
  },
  UNDER_REVIEW: {
    icon: "time",
    color: "#4285F4",
    title: "Under Review",
    subtitle: "Your documents are being reviewed.",
  },
  ACTION_REQUIRED: {
    icon: "alert-circle",
    color: "#FB8C00",
    title: "Action Required",
    subtitle: "Some documents need attention.",
  },
  INCOMPLETE: {
    icon: "close-circle",
    color: "#D93025",
    title: "Incomplete",
    subtitle: "Complete your verification to unlock full access.",
  },
};

export default function VerificationStatusHeader({
  verified,
  verificationList,
  onCompleteProfile,
}: Props) {
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

  if (globalStatus === "LOADING") return null;

  const header = statusConfig[globalStatus];

  return (
    <View style={styles.container}>
      <Ionicons name={header.icon} color={header.color} size={65} />

      <Text style={styles.title}>{header.title}</Text>

      <Text style={styles.subtitle}>{header.subtitle}</Text>

      {globalStatus === "INCOMPLETE" && onCompleteProfile && (
        <Button style={{ marginTop: Spacing.sm }} onPress={onCompleteProfile}>
          <Text style={{ color: "white" }}>Complete Profile</Text>
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "600",
  },
  subtitle: {
    color: "white",
    opacity: 0.7,
    textAlign: "center",
  },
});
