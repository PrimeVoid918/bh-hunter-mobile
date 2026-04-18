import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PropertiesMainScreen from "../properties.main.screen";
import PropertiesCreateScreen from "../properties.create.screen";
import PropertiesGetLocationScreen from "../properties.get-location.screen";
import { backButtonConfig } from "@/constants/navigation/screenOptions";
import RoomsDetailsScreen from "../screens/rooms/rooms.details.screen";
import RoomsListMainScreen from "../screens/rooms/rooms.list.main.screen";
import BoardingHouseDetailsScreen from "../screens/boarding-house.details.screen";

const Stack = createNativeStackNavigator();

export default function PropertiesStack() {
  return (
    <Stack.Navigator
      initialRouteName="PropertiesHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PropertiesHome" component={PropertiesMainScreen} />
      <Stack.Screen
        name="BoardingHouseDetailsScreen"
        options={backButtonConfig}
        component={BoardingHouseDetailsScreen}
      />
      <Stack.Screen
        name="RoomsDetailsScreen"
        options={backButtonConfig}
        component={RoomsDetailsScreen}
      />
      <Stack.Screen
        name="RoomsListMainScreen"
        options={backButtonConfig}
        component={RoomsListMainScreen}
      />
      <Stack.Screen
        name="PropertyCreate"
        options={backButtonConfig}
        component={PropertiesCreateScreen}
      />
      <Stack.Screen
        name="PropertyLocationPicker"
        options={backButtonConfig}
        component={PropertiesGetLocationScreen}
      />
    </Stack.Navigator>
  );
}
