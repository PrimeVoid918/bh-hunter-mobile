import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

// Stacks
import DashboardStack from "../screens/dashboard/navigation/dashboard.stack";
import BookingStack from "../screens/booking/navigation/booking.stack";
import MapStack from "@/features/shared/map/navigation/map.stack";
import NotificationMainScreen from "@/features/shared/notification/notification.main.screen";
import MenuStack from "@/features/shared/menu/navigation/menu.stack";
import { MenuStackParamListArrayName } from "@/features/shared/menu/navigation/menu.stack.types";

const Tab = createBottomTabNavigator();

export default function TenantTabs() {
  const theme = useTheme();

  const SHARED_TAB_BAR_STYLE = {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    height: Platform.OS === "ios" ? 88 : 70,
    elevation: 0,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
  };

  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarLabelStyle: {
          fontFamily: "Poppins-Medium",
          fontSize: 10,
        },
        tabBarStyle: SHARED_TAB_BAR_STYLE,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "view-dashboard" : "view-dashboard-outline";
              break;
            case "Booking":
              iconName = focused ? "calendar-check" : "calendar-check-outline";
              break;
            case "Map":
              iconName = focused
                ? "map-marker-radius"
                : "map-marker-radius-outline";
              break;
            case "Notification":
              iconName = focused ? "bell-badge" : "bell-outline";
              break;
            case "Menu":
              iconName = focused ? "dots-grid" : "dots-grid";
              break;
            default:
              iconName = "help-circle";
          }
          return (
            <MaterialCommunityIcons name={iconName} size={24} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Booking" component={BookingStack} />
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Notification" component={NotificationMainScreen} />
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "Menu";
          const isHidden = MenuStackParamListArrayName.includes(routeName);

          return {
            tabBarStyle: {
              ...SHARED_TAB_BAR_STYLE,
              display: isHidden ? "none" : "flex",
            },
          };
        }}
      />
    </Tab.Navigator>
  );
}
