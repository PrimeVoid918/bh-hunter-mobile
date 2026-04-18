import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RouteProp } from "@react-navigation/native";
import BookingsScreen from "../dashboard.bookings.screen";
import BookingDetailsScreen from "../dashboard.booking.details.screen";
import { backButtonConfig } from "@/constants/navigation/screenOptions";
import BookingStatusScreen from "@/features/shared/booking/BookingStatusScreen";

export type TenantDashboardBookingStackParamList = {
  BookingsScreen: undefined;
  BookingDetailsScreen: {
    bookId: number;
  };
  BookingStatusScreen: {
    bookId: number;
  };
};

// export type

const Stack =
  createNativeStackNavigator<TenantDashboardBookingStackParamList>();

export default function BookingStack() {
  return (
    <Stack.Navigator
      initialRouteName="BookingsScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="BookingStatusScreen"
        component={BookingStatusScreen}
        options={backButtonConfig}
      />

      <Stack.Screen
        name="BookingsScreen"
        component={BookingsScreen}
        options={backButtonConfig}
      />
      {/* <Stack.Screen
        name="DashboardBookingDetailsScreen"
        component={DashboardBookingDetailsScreen}
        options={backButtonConfig}
      />  */}
    </Stack.Navigator>
  );
}
