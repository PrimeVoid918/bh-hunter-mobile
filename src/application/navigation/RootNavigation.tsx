import { StatusBar } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "@/features/auth/navigation/auth.stack";
import AdminTabs from "@/features/admin/navigation/admin.tabs";
import TenantTabs from "@/features/tenant/navigation/tenant.tabs";
import OwnerTabs from "@/features/owner/navigation/owner.tabs";

import { RootStackParamList } from "../../features/types/navigation";
import { Colors } from "@/constants";
import { navigationRef } from "./navigationRef";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle={"light-content"} />
      <RootStack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
        }}
      >
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name="Admin" component={AdminTabs} />
        <RootStack.Screen name="Tenant" component={TenantTabs} />
        <RootStack.Screen name="Owner" component={OwnerTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
