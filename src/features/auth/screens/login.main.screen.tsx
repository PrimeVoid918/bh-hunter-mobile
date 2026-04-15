import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import {
  Surface,
  Text,
  TextInput,
  Button,
  Divider,
  useTheme,
} from "react-native-paper";
import { VStack } from "@gluestack-ui/themed";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import * as SecureStore from "expo-secure-store";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import HeaderLogo from "./HeaderLogo";
import Map from "@/features/shared/map/Map";

import { GlobalStyle } from "@/constants";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../application/store/stores";
import { login } from "@/infrastructure/auth/auth.redux.slice";
import { useLoginMutation } from "@/infrastructure/auth/auth.redux.api";
import { fetchUserDataThunk } from "@/infrastructure/auth/auth.redux.thunk";

import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { AuthStackParamList } from "../navigation/auth.stack.types";

export default function LoginMainScreen() {
  const theme = useTheme();
  const rootNavigation =
    useNavigation<BottomTabNavigationProp<RootStackParamList>>();
  const authNavigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [triggerLogin, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch<AppDispatch>();

  const onPressLogin = async () => {
    ReactNativeHapticFeedback.trigger("impactMedium");
    try {
      const { access_token, user } = await triggerLogin({
        username,
        password,
      }).unwrap();

      await SecureStore.setItemAsync("token", access_token);
      await SecureStore.setItemAsync("role", user.role);
      await SecureStore.setItemAsync("userId", user.id.toString());

      dispatch(login({ token: access_token, userData: user }));
      await dispatch(fetchUserDataThunk({ id: user.id, role: user.role }));

      if (user.role === "ADMIN") rootNavigation.navigate("Admin");
      else if (user.role === "OWNER") rootNavigation.navigate("Owner");
      else rootNavigation.navigate("Tenant");
    } catch (error) {
      Alert.alert("Login Failed", "Please check your credentials.");
    }
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
      variant="layout"
    >
      <VStack style={s.mainContainer}>
        <VStack style={s.floatingForm}>
          <View style={s.logoContainer}>
            <HeaderLogo />
          </View>

          <Surface elevation={4} style={s.glassCard}>
            <View style={s.formContent}>
              <Text variant="headlineSmall" style={s.welcomeText}>
                Welcome Back
              </Text>

              <View style={{ gap: 12 }}>
                <TextInput
                  label="Username"
                  mode="outlined"
                  value={username}
                  onChangeText={setUsername}
                  outlineStyle={s.inputOutline}
                  left={<TextInput.Icon icon="account-outline" />}
                />
                <TextInput
                  label="Password"
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  outlineStyle={s.inputOutline}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              </View>

              <View style={s.actionGroup}>
                <Button
                  onPress={onPressLogin}
                  mode="contained"
                  loading={isLoading}
                  style={s.button}
                  contentStyle={s.buttonInner}
                >
                  Login
                </Button>

                <Divider style={s.divider} />

                <Button
                  onPress={() => authNavigation.navigate("SignUp")}
                  mode="text"
                  labelStyle={s.signupLabel}
                >
                  Don't have an Account?
                </Button>
              </View>
            </View>
          </Surface>
        </VStack>

        <Map
          data={[]}
          handleMarkerPress={() => {}}
          mapStyle={s.mapStyle}
          backdropStyle={s.mapBackdrop}
        />
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignContent: "center",
    position: "relative",
  },
  floatingForm: {
    alignSelf: "center",
    width: "85%",
    zIndex: 2,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  glassCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  formContent: {
    flexDirection: "column",
    gap: 20,
  },
  welcomeText: {
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  inputOutline: {
    borderRadius: 12,
  },
  actionGroup: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
  },
  buttonInner: {
    height: 48,
  },
  divider: {
    marginVertical: 4,
  },
  signupLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  mapStyle: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 1,
  },
  mapBackdrop: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});
