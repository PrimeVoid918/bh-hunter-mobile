import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RouteProp } from "@react-navigation/native";
import DashboardMainScreen from "../screens/dashboard.main.screen";
import { backButtonConfig } from "@/constants/navigation/screenOptions";
import DashboardBookingStack from "../screens/bookings/navigation/bookings.stack";
import VerificationMainScreen from "@/features/shared/verification/verification.main.screen.";
// import { VerificationSubmitScreenMeta } from "../../../../owner/screens/dashboard/navigation/dashboard.types";
import VerificationSubmitScreen from "@/features/shared/verification/verification-submit.screen";
import VerificationViewScreen from "@/features/shared/verification/verification-view.screen";
import { VerificationSubmitScreenMeta } from '../../../../shared/verification/verificationConfig';

export type TenantDashboardStackParamList = {
  DashboardMainScreen: undefined;
  DashboardBookingStack: undefined;
  DashboardBookingRequestScreen: undefined;
  DashboardBookingHistoryScreen: undefined;
  DashboardBookmarksScreen: undefined;

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
      initialRouteName="DashboardMainScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DashboardMainScreen"
        component={DashboardMainScreen}
        // options={backButtonConfig}
      />
      <Stack.Screen
        name="DashboardBookingStack"
        component={DashboardBookingStack}
        // options={backButtonConfig}
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
