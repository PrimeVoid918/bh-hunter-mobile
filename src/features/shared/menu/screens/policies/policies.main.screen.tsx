import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  Surface,
  TouchableRipple,
  useTheme,
  Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";

export default function PoliciesMainScreen({ navigation }: any) {
  const theme = useTheme();
  const { selectedUser: userData } = useDynamicUserApi();

  const PolicyRow = ({ title, description, onPress, isLast }: any) => (
    <Surface elevation={0} style={s.rowSurface}>
      <TouchableRipple onPress={onPress} style={s.rowRipple}>
        <View style={s.rowContent}>
          <View style={s.textContainer}>
            <Text variant="titleMedium" style={s.rowTitle}>
              {title}
            </Text>
            <Text variant="bodySmall" style={s.rowDescription}>
              {description}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.colors.outline}
          />
        </View>
      </TouchableRipple>
      {!isLast && <Divider />}
    </Surface>
  );

  return (
    <StaticScreenWrapper style={{ backgroundColor: theme.colors.background }}>
      <View style={s.header}>
        <Text variant="headlineSmall" style={s.headerTitle}>
          Policies and Legal
        </Text>
        <Text variant="bodyMedium" style={s.headerSubtitle}>
          Everything you need to know about how we operate and protect your
          data.
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.listContainer}>
        <Text variant="labelLarge" style={s.sectionLabel}>
          GLOBAL POLICIES
        </Text>
        <View style={s.card}>
          <PolicyRow
            title="Terms of Service"
            description="The master agreement for all BH-Hunter users."
            onPress={() =>
              navigation.navigate("PolicyViewerScreen", { type: "terms" })
            }
          />
          <PolicyRow
            title="Privacy Policy"
            description="How we protect and manage your digital footprint."
            onPress={() =>
              navigation.navigate("PolicyViewerScreen", { type: "privacy" })
            }
            isLast
          />
        </View>

        <Text variant="labelLarge" style={s.sectionLabel}>
          TENANT POLICIES
        </Text>
        <View style={s.card}>
          <PolicyRow
            title="Booking Refund Policy"
            description="Rules for cancelling stays and refunding deposits."
            onPress={() =>
              navigation.navigate("PolicyViewerScreen", {
                type: "refund",
                subType: "booking",
              })
            }
          />
          <PolicyRow
            title="Tenant Legitimacy Consent"
            description="Agreement for identity verification and stay rules."
            onPress={() =>
              navigation.navigate("PolicyViewerScreen", {
                type: "consent",
                subType: "tenant",
              })
            }
            isLast
          />
        </View>

        <Text variant="labelLarge" style={s.sectionLabel}>
          OWNER POLICIES
        </Text>
        <View style={s.card}>
          <PolicyRow
            title="Subscription Refund Policy"
            description="Terms for listing and management fee refunds."
            onPress={() =>
              navigation.navigate("PolicyViewerScreen", {
                type: "refund",
                subType: "subscription",
              })
            }
          />
          <PolicyRow
            title="Owner Legitimacy Consent"
            description="Agreement for listing authenticity and ownership."
            onPress={() =>
              navigation.navigate("PolicyViewerScreen", {
                type: "consent",
                subType: "owner",
              })
            }
            isLast
          />
        </View>
      </ScrollView>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  header: { padding: 20, marginBottom: 10 },
  headerTitle: { fontFamily: "Poppins-Bold" },
  headerSubtitle: { fontFamily: "Poppins-Regular", color: "#666" },
  listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: {
    marginLeft: 4,
    marginBottom: 8,
    marginTop: 20,
    color: "#888",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  rowSurface: { backgroundColor: "transparent" },
  rowRipple: { padding: 16 },
  rowContent: { flexDirection: "row", alignItems: "center" },
  textContainer: { flex: 1, paddingRight: 10 },
  rowTitle: { fontFamily: "Poppins-SemiBold" },
  rowDescription: { fontFamily: "Poppins-Regular", color: "#777" },
});
