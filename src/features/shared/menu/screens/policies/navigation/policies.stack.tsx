import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PoliciesMainScreen from "../policies.main.screen";
import PolicyViewerScreen from "../PolicyViewer";
import { backButtonConfig } from "@/constants/navigation/screenOptions";

const Stack = createNativeStackNavigator();

export default function PoliciesStack() {
  return (
    <Stack.Navigator
      initialRouteName="PoliciesMainScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PoliciesMainScreen" component={PoliciesMainScreen} />
      <Stack.Screen
        name="PolicyViewerScreen"
        component={PolicyViewerScreen}
        options={backButtonConfig}
      />
    </Stack.Navigator>
  );
}
