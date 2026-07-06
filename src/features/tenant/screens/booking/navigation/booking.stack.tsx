import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { backButtonConfig } from "@/constants/navigation/screenOptions";

import BookingListsScreen from "../booking.lists.screen";
import BoardingHouseDetailsScreen from "../details/boarding-house.details.screen";
import RoomsBookingListsScreen from "../rooms.selection/rooms.booking-list.screen";
import RoomsDetailsScreen from "../rooms.selection/rooms.details.screen";
import RoomsCheckoutScreen from "../rooms.selection/rooms.checkout.screen";
import { TenantBookingStackParamList } from "./booking.types";
import BookingAgreementWebviewMainScreen from "../rooms.selection/BookingAgreementWebviewMainScreen";

const Stack = createNativeStackNavigator<TenantBookingStackParamList>();

export default function BookingStack() {
  return (
    <Stack.Navigator
      initialRouteName="BoardingHouseLists"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="BoardingHouseLists"
        component={BookingListsScreen}
      />
      <Stack.Screen
        name="BoardingHouseDetails"
        component={BoardingHouseDetailsScreen}
        options={backButtonConfig}
      />
      <Stack.Screen
        name="RoomsBookingListsScreen"
        component={RoomsBookingListsScreen}
        options={backButtonConfig}
      />
      <Stack.Screen
        name="RoomsDetailsScreen"
        component={RoomsDetailsScreen}
        options={backButtonConfig}
      />
      <Stack.Screen
        name="RoomsCheckoutScreen"
        component={RoomsCheckoutScreen}
        options={backButtonConfig}
      />

      <Stack.Screen
        name="BookingAgreementWebviewMainScreen"
        component={BookingAgreementWebviewMainScreen}
      />
    </Stack.Navigator>
  );
}
