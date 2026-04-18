import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RouteProp } from "@react-navigation/native";
import MainScreen from "../screens/dashboard.main.screen";
import { backButtonConfig } from "@/constants/navigation/screenOptions";
import BookingStack from "../screens/bookings/navigation/bookings.stack";
import VerificationMainScreen from "@/features/shared/verification/verification.main.screen.";
import VerificationSubmitScreen from "@/features/shared/verification/verification-submit.screen";
import VerificationViewScreen from "@/features/shared/verification/verification-view.screen";
import { VerificationSubmitScreenMeta } from "../../../../shared/verification/verificationConfig";
import BookingStatusScreen from "@/features/shared/booking/BookingStatusScreen";
import BookingHistoryScreen from "../screens/booking-history/booking.history.screen";

export type TenantDashboardStackParamList = {
  MainScreen: undefined;
  BookingStack: undefined;
  BookingRequestScreen: undefined;
  BookingHistoryScreen: undefined;
  BookmarksScreen: undefined;

  BookingStatusScreen: {
    bookId: number;
  };

  VerificationMainScreen: undefined;
  VerificationSubmitScreen: {
    userId: number;
    meta: VerificationSubmitScreenMeta;
  };
  VerificationViewScreen: {
    userId: number;
    docId: number;
    meta: VerificationSubmitScreenMeta;
  };
};

// export type

const Stack = createNativeStackNavigator<TenantDashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      initialRouteName="MainScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        // options={backButtonConfig}
      />
      <Stack.Screen
        name="BookingStack"
        component={BookingStack}
        // options={backButtonConfig}
      />
      <Stack.Screen
        name="BookingStatusScreen"
        component={BookingStatusScreen}
        options={backButtonConfig}
      />
      <Stack.Screen
        name="BookingHistoryScreen"
        component={BookingHistoryScreen}
        options={backButtonConfig}
      />
      <Stack.Screen
        name="VerificationMainScreen"
        options={backButtonConfig}
        component={VerificationMainScreen}
      />
      <Stack.Screen
        name="VerificationSubmitScreen"
        options={backButtonConfig}
        component={VerificationSubmitScreen}
      />
      <Stack.Screen
        name="VerificationViewScreen"
        options={backButtonConfig}
        component={VerificationViewScreen}
      />
    </Stack.Navigator>
  );
}
