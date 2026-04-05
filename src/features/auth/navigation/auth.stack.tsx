import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/login.main.screen";
import SignUpStack from "../screens/signup/navigation/sign-up.stack";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  console.log("AuthStack");

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login" // Screen names should be capitalized
        component={LoginScreen} // Pass the component directly here
      />
      <Stack.Screen
        name="SignUp" // Screen names should be capitalized
        component={SignUpStack} // Pass the component directly here
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
