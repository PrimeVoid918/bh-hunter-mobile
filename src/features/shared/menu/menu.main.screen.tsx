import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Avatar,
  Text,
  Surface,
  TouchableRipple,
  useTheme,
  Divider,
  IconButton,
  Badge,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useDispatch } from "react-redux";
import { useNavigation, CommonActions } from "@react-navigation/native";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { logout } from "@/infrastructure/auth/auth.redux.slice";
import { BorderRadius, Spacing } from "@/constants";

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function MenuMainScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { selectedUser: userData, refetch } = useDynamicUserApi();
  const navigation = useNavigation<any>();

  const [refreshing, setRefreshing] = React.useState(false);

  // Badge Logic
  const needsProfileUpdate = !userData?.firstname || !userData?.lastname;
  const needsSecurityUpdate = !userData?.phone_number;

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
  };

  const handleLogout = () => {
    triggerHaptic();
    dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Auth" }] }),
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch?.().finally(() => setRefreshing(false));
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    isLast,
    color,
    showBadge,
  }: any) => (
    <>
      <TouchableRipple
        onPress={() => {
          triggerHaptic();
          onPress?.();
        }}
        style={s.menuItem}
        rippleColor="rgba(0, 0, 0, .05)"
      >
        <View style={s.menuItemContent}>
          <View style={s.iconBg}>
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={color || theme.colors.onSurfaceVariant}
            />
          </View>
          <Text
            style={[s.menuLabel, { color: color || theme.colors.onSurface }]}
          >
            {label}
          </Text>
          {showBadge && <Badge size={8} style={s.dotBadge} />}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.colors.outlineVariant}
          />
        </View>
      </TouchableRipple>
      {!isLast && <Divider style={s.divider} />}
    </>
  );

  return (
    <StaticScreenWrapper
      style={{ backgroundColor: theme.colors.background }}
      variant="list"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <View style={s.mainContainer}>
        {/* --- PAGE TITLE SECTION --- */}
        <View style={s.headerSection}>
          <Text variant="displaySmall" style={s.pageTitle}>
            Account
          </Text>
          <Text variant="bodyMedium" style={s.pageSubtitle}>
            Manage your profile and security
          </Text>
        </View>

        {/* --- PROFILE CARD --- */}
        <Surface
          elevation={0}
          style={[s.profileCard, { borderColor: theme.colors.outlineVariant }]}
        >
          <View style={s.profileTop}>
            <View>
              <Avatar.Text
                size={60}
                label={`${userData?.firstname?.[0] || "U"}${userData?.lastname?.[0] || ""}`}
                style={{ backgroundColor: theme.colors.primaryContainer }}
                labelStyle={{
                  color: theme.colors.onPrimaryContainer,
                  fontFamily: "Poppins-Medium",
                }}
              />
              {needsProfileUpdate && (
                <Badge style={s.avatarBadge} size={14}>
                  !
                </Badge>
              )}
            </View>

            <View style={s.nameWrapper}>
              <View style={s.roleBadge}>
                <Text style={[s.roleText, { color: theme.colors.primary }]}>
                  {userData?.role || "TENANT"}
                </Text>
              </View>
              <Text style={s.userName}>
                {userData?.firstname} {userData?.lastname}
              </Text>
              <Text style={s.userHandle}>@{userData?.username || "user"}</Text>
            </View>

            <IconButton
              icon="pencil-outline"
              mode="contained-tonal"
              size={20}
              onPress={() => {
                triggerHaptic();
                navigation.navigate("UserEdit");
              }}
            />
          </View>
        </Surface>

        {/* --- SECURITY SECTION --- */}
        <View style={s.sectionContainer}>
          <Text variant="labelLarge" style={s.sectionHeader}>
            SECURITY & ACCESS
          </Text>
          <Surface
            elevation={0}
            style={[s.menuGroup, { borderColor: theme.colors.outlineVariant }]}
          >
            <MenuItem
              icon="shield-check-outline"
              label="Account Security"
              showBadge={needsSecurityUpdate}
              onPress={() => navigation.navigate("AccountSecurity")}
            />
            <MenuItem icon="bell-ring-outline" label="Notifications" />
          </Surface>
        </View>

        {/* --- SUPPORT SECTION --- */}
        <View style={s.sectionContainer}>
          <Text variant="labelLarge" style={s.sectionHeader}>
            SUPPORT
          </Text>
          <Surface
            elevation={0}
            style={[s.menuGroup, { borderColor: theme.colors.outlineVariant }]}
          >
            <MenuItem
              icon="lifebuoy"
              label="Help Center"
              onPress={() => navigation.navigate("CustomerHelp")}
            />
            <MenuItem
              icon="file-document-outline"
              label="Terms of Service"
              isLast
            />
          </Surface>
        </View>

        {/* --- LOGOUT --- */}
        <View style={s.logoutContainer}>
          <Surface
            elevation={0}
            style={[s.menuGroup, { borderColor: theme.colors.outlineVariant }]}
          >
            <MenuItem
              icon="logout-variant"
              label="Sign Out"
              onPress={handleLogout}
              color={theme.colors.error}
              isLast
            />
          </Surface>
          <Text style={s.versionText}>Version 1.0.2 (Capstone Build)</Text>
        </View>
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainContainer: {},
  headerSection: { marginBottom: 24, marginTop: 8 },
  pageTitle: { fontFamily: "Poppins-Bold", color: "#1A1A1A" },
  pageSubtitle: {
    fontFamily: "Poppins-Regular",
    color: "#767474",
    marginTop: -4,
  },

  profileCard: {
    padding: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
  },
  profileTop: { flexDirection: "row", alignItems: "center" },
  nameWrapper: { flex: 1, marginLeft: 16 },
  roleBadge: {
    backgroundColor: "#D6ECFA",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 2,
  },
  roleText: { fontFamily: "Poppins-Bold", fontSize: 9, letterSpacing: 0.5 },
  userName: { fontFamily: "Poppins-SemiBold", fontSize: 18, color: "#1A1A1A" },
  userHandle: {
    fontFamily: "Poppins-Regular",
    color: "#767474",
    fontSize: 13,
    marginTop: -2,
  },
  avatarBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#D64545",
  },

  sectionContainer: { marginBottom: 24 },
  sectionHeader: {
    marginLeft: 4,
    marginBottom: 8,
    fontFamily: "Poppins-Bold",
    color: "#767474",
    fontSize: 12,
  },
  menuGroup: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemContent: { flexDirection: "row", alignItems: "center" },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontFamily: "Poppins-Medium",
    fontSize: 15,
  },
  dotBadge: { marginRight: 8, backgroundColor: "#F78C6B" },
  divider: { height: 1, backgroundColor: "#F0F0F5" },

  logoutContainer: { marginTop: 8, marginBottom: 40 },
  versionText: {
    textAlign: "center",
    marginTop: 16,
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#CCCCCC",
  },
});
