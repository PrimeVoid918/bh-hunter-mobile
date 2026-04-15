import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MenuMainScreen from "../menu.main.screen";
import MenuUserEditMainScreen from "../screens/user/menu.user-edit.main.screen";
import MenuCustomerHelpMainScreen from "../screens/accessibility/menu.customer-help.main.screen";
import MenuAccessibilityMainScreen from "../screens/accessibility/menu.accessibility.main.screen";
import MenuAccountSecurityScreen from "../screens/user/menu.account-security.screen";
import PoliciesStack from "../screens/policies/navigation/policies.stack";

const Stack = createNativeStackNavigator();

export default function MenuStack() {
  return (
    <Stack.Navigator
      initialRouteName="MenuTab"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MenuTab" component={MenuMainScreen} />
      <Stack.Screen name="UserEdit" component={MenuUserEditMainScreen} />
      <Stack.Screen
        name="CustomerHelp"
        component={MenuCustomerHelpMainScreen}
      />
      <Stack.Screen
        name="Accessibility"
        component={MenuAccessibilityMainScreen}
      />
      <Stack.Screen
        name="AccountSecurity"
        component={MenuAccountSecurityScreen}
      />
      <Stack.Screen name="PoliciesStack" component={PoliciesStack} />
    </Stack.Navigator>
  );
}
