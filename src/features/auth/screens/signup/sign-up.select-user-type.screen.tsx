import { View, Text, StyleSheet } from "react-native";
import React from "react";

// UI layout
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// UI components
import Button from "@/components/ui/Button";

// Global Styles
import { Colors, Fontsize, GlobalStyle, Spacing } from "@/constants";

// routing
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SignUpStackParamList } from "./navigation/sign-up.stack.types";

export default function SignUpSelectUserTypeScreen() {
  const route =
    useNavigation<NativeStackNavigationProp<SignUpStackParamList>>();

  function buttonOwnerPressHandler() {
    route.navigate("SignUpOwner");
  }

  function buttonTenantPressHandler() {
    route.navigate("SignUpTenant");
  }
  return (
    <>
      <StaticScreenWrapper
        style={[GlobalStyle.GlobalsContainer]}
        contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: Spacing.xxl,

            height: "30%",
            padding: Spacing.lg,
          }}
        >
          <View>
            <Text
              style={{
                color: Colors.TextInverse[1],
                fontSize: Fontsize.xl,
              }}
            >
              What type of user are you?
            </Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              gap: Spacing.xl,
              alignItems: "center",
            }}
          >
            <Button
              title="Owner"
              onPressAction={buttonOwnerPressHandler}
              containerStyle={s.button}
              textStyle={s.button_text}
            />
            <Button
              title="Tenant"
              onPressAction={buttonTenantPressHandler}
              containerStyle={s.button}
              textStyle={s.button_text}
            />
          </View>
        </View>
      </StaticScreenWrapper>
    </>
  );
}

const s = StyleSheet.create({
  button: {
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  button_text:{
  }
});
