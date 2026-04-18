import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BookingMainScreen from "../booking.main.screen";
import BookingListsScreen from "../booking.lists.screen";
// import PropertiesDetailsScreen from "../details/properties.details.screen";
import BookingStatusScreen from "@/features/shared/booking/BookingStatusScreen";
import { backButtonConfig } from "@/constants/navigation/screenOptions";
import { OwnerBookingStackParamList } from "./booking.types";

const Stack = createNativeStackNavigator<OwnerBookingStackParamList>();

export default function BookingStack() {
  return (
    <Stack.Navigator
      initialRouteName="BookingMainScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="BookingMainScreen"
        component={BookingMainScreen}
        // options={backButtonConfig}
      />
      <Stack.Screen
        name="BookingListsScreen"
        component={BookingListsScreen}
        options={backButtonConfig}
      />
      <Stack.Screen
        name="BookingStatusScreen"
        component={BookingStatusScreen}
        options={backButtonConfig}
      />
    </Stack.Navigator>
  );
}
