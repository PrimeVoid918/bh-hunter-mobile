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
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// Swapped to your installed dependency
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useDispatch } from "react-redux";
import { useNavigation, CommonActions } from "@react-navigation/native";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import ScreenHeaderComponent from "@/components/layout/ScreenHeaderComponent";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { logout } from "@/infrastructure/auth/auth.redux.slice";

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function MenuMainScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { selectedUser: userData } = useDynamicUserApi();
  const navigation = useNavigation<any>();

  const triggerHaptic = () => {
    // Using the 'impactLight' pattern specified in your Design Anchor
    ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
  };

  const handleLogout = () => {
    triggerHaptic();
    dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Auth" }],
      }),
    );
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    isLast = false,
    color = theme.colors.onSurface,
  }: any) => (
    <>
      <TouchableRipple
        onPress={() => {
          triggerHaptic();
          onPress?.();
        }}
        rippleColor="rgba(0, 0, 0, .08)"
        borderless={true} // M3 requirement from your anchor
        style={s.menuItem}
      >
        <View style={s.menuItemContent}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
          <Text variant="bodyLarge" style={[s.menuLabel, { color }]}>
            {label}
          </Text>
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
    <StaticScreenWrapper style={{ backgroundColor: theme.colors.background }}>
      <ScreenHeaderComponent text={{ textValue: "Account" }} />

      <View style={s.container}>
        {/* User Profile Section */}
        <Surface
          elevation={0}
          style={[s.profileCard, { borderColor: theme.colors.outlineVariant }]}
        >
          <View style={s.profileTop}>
            <Avatar.Text
              size={60}
              label={`${userData?.firstname?.[0] || "U"}${userData?.lastname?.[0] || ""}`}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              labelStyle={{
                color: theme.colors.onPrimaryContainer,
                fontFamily: "Poppins-Medium",
              }}
            />
            <View style={s.nameWrapper}>
              <Text variant="titleLarge" style={s.userName}>
                {userData?.firstname} {userData?.lastname}
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.outline,
                  fontFamily: "Poppins-Regular",
                }}
              >
                @{userData?.username}
              </Text>
            </View>
            <IconButton
              icon="pencil"
              mode="contained-tonal"
              containerColor={theme.colors.secondary}
              iconColor={theme.colors.onSecondary}
              size={20}
              onPress={() => {
                triggerHaptic();
                navigation.navigate("UserEdit");
              }}
            />
          </View>
        </Surface>

        {/* Main Menu Group */}
        <Text variant="labelMedium" style={s.sectionHeader}>
          GENERAL
        </Text>
        <Surface
          elevation={0}
          style={[s.menuGroup, { borderColor: theme.colors.outlineVariant }]}
        >
          <MenuItem icon="cog" label="Settings" />
          <MenuItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => navigation.navigate("CustomerHelp")}
          />
          <MenuItem
            icon="accessibility"
            label="Accessibility"
            onPress={() => navigation.navigate("Accessibility")}
          />
          {userData?.role === "ADMIN" && (
            <MenuItem
              icon="shield-check-outline"
              label="Admin Logs"
              onPress={() => navigation.navigate("Auth")}
            />
          )}
        </Surface>

        {/* Exit Group */}
        <View style={{ marginTop: 24 }}>
          <Surface
            elevation={0}
            style={[s.menuGroup, { borderColor: theme.colors.outlineVariant }]}
          >
            <MenuItem
              icon="logout"
              label="Sign Out"
              onPress={handleLogout}
              color={theme.colors.error}
              isLast={true}
            />
          </Surface>
        </View>
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 16,
  },
  profileCard: {
    padding: 16,
    borderRadius: 16, // xl radius from tokens
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontFamily: "Poppins-SemiBold",
    lineHeight: 28,
  },
  sectionHeader: {
    marginLeft: 8,
    marginBottom: 8,
    fontFamily: "Poppins-Medium",
    color: "#767474",
  },
  menuGroup: {
    borderRadius: 16, // xl radius
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    marginLeft: 16,
    fontFamily: "Poppins-Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F5",
  },
});
