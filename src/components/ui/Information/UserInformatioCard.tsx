import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Surface,
  Avatar,
  useTheme,
  Divider,
  Icon,
} from "react-native-paper";
import { Spacing } from "@/constants";

type Props = {
  user?: Record<string, any> | null;
  title?: string;
};

export default function UserInformationCard({ user, title }: Props) {
  const theme = useTheme();

  const userInfo = useMemo(() => {
    if (!user) return null;
    return {
      name:
        `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() ||
        user.username ||
        "User",
      username: user.username ? `@${user.username}` : "",
      email: user.email ?? "No email",
      phone: user.phone_number ?? user.contactNumber ?? "Not provided",
      isVerified:
        user.registrationStatus === "COMPLETED" &&
        user.verificationLevel === "FULLY_VERIFIED",
      avatarUrl: user.profilePicture?.url ?? null,
    };
  }, [user]);

  if (!userInfo) return null;

  return (
    <View style={s.outerContainer}>
      {title && (
        <Text
          variant="labelLarge"
          style={[s.sectionTitle, { color: theme.colors.outline }]}
        >
          {title.toUpperCase()}
        </Text>
      )}

      <Surface
        elevation={0}
        style={[s.container, { backgroundColor: theme.colors.surface }]}
      >
        <View style={s.headerRow}>
          {/* Avatar with Custom Secondary Border if Verified */}
          <View style={s.avatarWrapper}>
            {userInfo.avatarUrl ? (
              <Avatar.Image
                size={54}
                source={{ uri: userInfo.avatarUrl }}
                style={{ backgroundColor: theme.colors.surfaceVariant }}
              />
            ) : (
              <Avatar.Text
                size={54}
                label={userInfo.name.substring(0, 2).toUpperCase()}
                style={{ backgroundColor: theme.colors.primaryContainer }}
                labelStyle={{
                  color: theme.colors.onPrimaryContainer,
                  fontFamily: "Poppins-Medium",
                }}
              />
            )}

            {userInfo.isVerified && (
              <View
                style={[
                  s.verifiedIcon,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Icon source="check" size={12} color="white" />
              </View>
            )}
          </View>

          <View style={s.identitySection}>
            <Text
              variant="titleMedium"
              style={{
                fontFamily: "Poppins-Medium",
                color: theme.colors.onSurface,
              }}
            >
              {userInfo.name}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.outline, marginTop: -2 }}
            >
              {userInfo.username}
            </Text>
          </View>

          {/* Status Label using your Secondary color */}
          <View
            style={[
              s.statusBadge,
              {
                backgroundColor: userInfo.isVerified
                  ? theme.colors.primaryContainer
                  : theme.colors.error,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: userInfo.isVerified
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.textInverse,
                fontWeight: "bold",
              }}
            >
              {userInfo.isVerified ? "VERIFIED" : "NOT VERIFIED"}
            </Text>
          </View>
        </View>

        <Divider style={s.divider} />

        {/* Contact Info with proper M3 spacing */}
        <View style={s.infoGrid}>
          <View style={s.infoItem}>
            <Icon
              source="email-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" style={s.infoText}>
              {userInfo.email}
            </Text>
          </View>

          <View style={s.infoItem}>
            <Icon
              source="phone-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" style={s.infoText}>
              {userInfo.phone}
            </Text>
          </View>
        </View>
      </Surface>
    </View>
  );
}

const s = StyleSheet.create({
  outerContainer: {
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  verifiedIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  identitySection: {
    marginLeft: 16,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontFamily: "Poppins-Regular",
    opacity: 0.8,
  },
});
