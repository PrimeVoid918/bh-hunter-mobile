import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapMainScreen from "../map.main.screen";
import { Colors } from "@/constants";

const Stack = createNativeStackNavigator();

export default function MapStack() {
  const backButtonConfig = {
    headerShown: true,
    title: "",
    headerStyle: {
      // backgroundColor: Colors.
    },
    // headerTintColor: Colors.
  };

  return (
    <Stack.Navigator
      initialRouteName="MapMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MapMain"
        component={MapMainScreen}
        // options={backButtonConfig}
      />
    </Stack.Navigator>
  );
}
