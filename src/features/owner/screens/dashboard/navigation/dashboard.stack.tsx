import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BoardingHouseDetailsScreen from "../boarding-house.details.screen";
import DashboardMainScreen from "../dashboard.main.screen";
import { backButtonConfig } from "@/constants/navigation/screenOptions";
import VerificationMainScreen from "../verification/verification.main.screen.";
import VerificationSubmitScreen from "../verification/verification-submit.screen";
import VerificationViewScreen from "../verification/verification-view.screen";
import RoomsListMainScreen from "../rooms/rooms.list.main.screen";
import { OwnerDashboardStackParamList } from "./dashboard.types";
import RoomsDetailsScreen from "../rooms/rooms.details.screen";

const Stack = createNativeStackNavigator<OwnerDashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      initialRouteName="DashboardScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DashboardScreen" component={DashboardMainScreen} />
      <Stack.Screen
        name="BoardingHouseDetailsScreen"
        options={backButtonConfig}
        component={BoardingHouseDetailsScreen}
      />
      <Stack.Screen
        name="RoomsListMainScreen"
        options={backButtonConfig}
        component={RoomsListMainScreen}
      />
      <Stack.Screen
        name="RoomsDetailsScreen"
        options={backButtonConfig}
        component={RoomsDetailsScreen}
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
