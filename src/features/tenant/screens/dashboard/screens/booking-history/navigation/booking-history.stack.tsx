import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BookingHistoryScreen from "../booking.history.screen";

type TenantBookingHistoryStackParamList = {
  BookingHistoryScreen: undefined;
};

// export type

const Stack = createNativeStackNavigator<TenantBookingHistoryStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      initialRouteName="BookingHistoryScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="BookingHistoryScreen"
        component={BookingHistoryScreen}
        // options={backButtonConfig}
      />
    </Stack.Navigator>
  );
}
