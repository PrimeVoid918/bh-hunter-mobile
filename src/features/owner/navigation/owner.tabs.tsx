import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import {
  // BorderRadius,
  // BorderWidth,
  Colors,
  GlobalStyle,
  // ShadowLight,
  // Spacing,
} from "@/constants/";
import { BottomNavBarStyleConfig } from "@/components/layout/BottomNavBarStyleConfig";
import { CustomTabIcon } from "@/components/layout/BottomNavBarStyleIcon";

import PropertiesStack from "../screens/properties/navigation/properties.stack";
import BookingStack from "@/features/owner/screens/booking/navigation/booking.stack";
import DashboardStack from "../screens/dashboard/navigation/dashboard.stack";
import NotificationMainScreen from "@/features/shared/notification/notification.main.screen";
import MenuStack from "@/features/shared/menu/navigation/menu.stack";
import { MenuStackParamListArrayName } from "@/features/shared/menu/navigation/menu.stack.types";
import { GlobalBottomNavigationStyles } from "@/constants/GlobalStyle";

const Tab = createBottomTabNavigator();

export default function OwnerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? "";
        console.log("Troute:", routeName);

        return {
          lazy: false,
          tabBarStyle: {
            backgroundColor:
              GlobalBottomNavigationStyles.containerBackgroundColor,
            borderColor: GlobalBottomNavigationStyles.containerBackgroundColor,
            height: GlobalBottomNavigationStyles.containerIconHeight,
          },
          tabBarIcon: ({ focused, color }) => {
            const getIconName = (routeName: string, focused: boolean) => {
              if (routeName === "Properties")
                return focused ? "business" : "business-outline";
              else if (routeName === "Booking")
                return focused ? "book" : "book-outline";
              else if (routeName === "Dashboard")
                return focused ? "receipt" : "receipt-outline";
              else if (routeName === "Notification")
                return focused ? "notifications" : "notifications-outline";
              else if (routeName === "Menu")
                return focused ? "menu" : "menu-outline";
            };

            const iconName = getIconName(route.name, focused);
            return (
              <CustomTabIcon name={iconName} focused={focused} color={color} />
            );
          },
          ...BottomNavBarStyleConfig,
        };
      }}
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

          const hideTabBarRoutes = MenuStackParamListArrayName;

          return {
            tabBarStyle: {
              display: hideTabBarRoutes.includes(routeName) ? "none" : "flex",
              backgroundColor:
                GlobalBottomNavigationStyles.containerBackgroundColor,
              height: GlobalBottomNavigationStyles.containerIconHeight,
            },
            ...BottomNavBarStyleConfig,
          };
        }}
      />
    </Tab.Navigator>
  );
}
