import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardMainScreen from "../dashboard.main.screen";
import { backButtonConfig } from "@/constants/navigation/screenOptions";
import VerificationMainScreen from "../../../../shared/verification/verification.main.screen.";
import VerificationSubmitScreen from "../../../../shared/verification/verification-submit.screen";
import VerificationViewScreen from "../../../../shared/verification/verification-view.screen";
import { OwnerDashboardStackParamList } from "./dashboard.types";
import MenuUserEditScreen from "@/features/shared/menu/screens/user/menu.user-edit.main.screen";

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
      <Stack.Screen
        name="ProfileEditScreen"
        options={backButtonConfig}
        component={MenuUserEditScreen}
      />
    </Stack.Navigator>
  );
}
