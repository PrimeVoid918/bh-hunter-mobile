import { StyleSheet } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

//ui component
import { BottomNavBarStyleConfig } from "@/components/layout/BottomNavBarStyleConfig";
import { CustomTabIcon } from "@/components/layout/BottomNavBarStyleIcon";

import { Colors, GlobalStyle } from "@/constants/";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

import DashboardStack from "../screens/dashboard/navigation/dashboard.stack";
import BookingStack from "../screens/booking/navigation/booking.stack";
import MapStack from "@/features/shared/map/navigation/map.stack";
import NotificationMainScreen from "@/features/shared/notification/notification.main.screen";
import MenuStack from "@/features/shared/menu/navigation/menu.stack";
import { MenuStackParamListArrayName } from "@/features/shared/menu/navigation/menu.stack.types";
import { GlobalBottomNavigationStyles } from "@/constants/GlobalStyle";

const Tab = createBottomTabNavigator();

export default function TenantTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
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
              if (routeName === "Dashboard")
                return focused ? "receipt" : "receipt-outline";
              else if (routeName === "Booking")
                return focused ? "bookmarks" : "bookmarks-outline";
              else if (routeName === "Map")
                return focused ? "map" : "map-outline";
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
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Booking" component={BookingStack} />
      <Tab.Screen name="Map" component={MapStack} />
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
