import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

// Stacks
import PropertiesStack from "../screens/properties/navigation/properties.stack";
import BookingStack from "@/features/owner/screens/booking/navigation/booking.stack";
import DashboardStack from "../screens/dashboard/navigation/dashboard.stack";
import NotificationMainScreen from "@/features/shared/notification/notification.main.screen";
import MenuStack from "@/features/shared/menu/navigation/menu.stack";

// Types
import { MenuStackParamListArrayName } from "@/features/shared/menu/navigation/menu.stack.types";

const Tab = createBottomTabNavigator();

export default function OwnerTabs() {
  const theme = useTheme();

  // Unified Style: Prevents layout "jumping" and enforces BH-HUNTER design tokens
  const SHARED_TAB_BAR_STYLE = {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    height: Platform.OS === "ios" ? 88 : 70,
    elevation: 0, // Contained look: no shadow
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
  };

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: false,
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
            case "Properties":
              iconName = focused ? "home-city" : "home-city-outline";
              break;
            case "Booking":
              iconName = focused ? "calendar-check" : "calendar-check-outline";
              break;
            case "Dashboard":
              iconName = focused ? "view-dashboard" : "view-dashboard-outline";
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
      <Tab.Screen name="Properties" component={PropertiesStack} />
      <Tab.Screen name="Booking" component={BookingStack} />
      <Tab.Screen name="Dashboard" component={DashboardStack} />
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
