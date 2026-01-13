import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PropertiesMainScreen from "../properties.main.screen";
import PropertiesBookingListsScreen from "../properties.booking.lists.screen";
import PropertiesDetailsScreen from "../details/properties.details.screen";
import { backButtonConfig } from "@/constants/navigation/screenOptions";
import { OwnerBookingStackParamList } from "./booking.types";

const Stack = createNativeStackNavigator<OwnerBookingStackParamList>();

export default function BookingStack() {
  return (
    <Stack.Navigator
      initialRouteName="PropertiesMainScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="PropertiesMainScreen"
        component={PropertiesMainScreen}
        // options={backButtonConfig}
      />
      <Stack.Screen
        name="PropertiesBookingListsScreen"
        component={PropertiesBookingListsScreen}
        options={backButtonConfig}
      />
      <Stack.Screen
        name="PropertiesDetailsScreen"
        component={PropertiesDetailsScreen}
        options={backButtonConfig}
      />
    </Stack.Navigator>
  );
}
