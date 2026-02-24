import { StyleSheet, ImageStyle, Alert } from "react-native";
import { View, Text, VStack } from "@gluestack-ui/themed";

import React, { useState, useEffect } from "react";
// UI Layout
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// UI comopnent
// import TextInput from "@/components/ui/TextInput";
// import Button from "@/components/ui/Button";

// constants
import {
  Colors,
  Fontsize,
  BorderRadius,
  Spacing,
  GlobalStyle,
  ShadowLight,
  BorderWidth,
} from "@/constants";

// Routing
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { AuthStackParamList } from "../navigation/auth.stack.types";

// redux
import { useDispatch } from "react-redux";
import { login } from "@/infrastructure/auth/auth.redux.slice";
import { useLoginMutation } from "@/infrastructure/auth/auth.redux.slice";
import { fetchUserDataThunk } from "@/infrastructure/auth/auth.redux.thunk";
import { AppDispatch } from "../../../application/store/stores";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import {
  expoStorageCleaner,
  logExpoSystemDir,
} from "@/infrastructure/utils/expo-utils/expo-utils.service";
import { Surface, TextInput, Button, Divider } from "react-native-paper";
import Map from "@/features/shared/map/Map";
import HeaderLogo from "./HeaderLogo";

export default function LoginMainScreen() {
  const rootNavigation =
    useNavigation<BottomTabNavigationProp<RootStackParamList>>();
  const authNavitaion =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [username, setUsername] = useState({ value: "", error: false });
  const [password, setPassword] = useState({ value: "", error: false });

  // redux
  const [
    triggerLogin,
    { isLoading: isLoginLoading, error: isLoginError, error: errorObj },
  ] = useLoginMutation();
  const dispatch = useDispatch<AppDispatch>();

  // useEffect(() => {
  //   setTimeout(() => {
  //     onPressLogin();
  //   }, 700);
  // }, []);

  const onPressLogin = async () => {
    const packageLoad = {
      username: username.value,
      password: password.value,
    };

    // const packageLoad = {
    //   username: "owner1",
    //   password: "owner1",
    // };
    await logExpoSystemDir(["images", "documents"]);
    console.log("packageLoad: ", packageLoad);
    try {
      const { access_token, user } = await triggerLogin(packageLoad).unwrap();
      dispatch(
        login({
          token: access_token,
          userData: user,
        }),
      );
      await dispatch(
        fetchUserDataThunk({ id: user.id as number, role: user.role }),
      );

      if (user.role == "ADMIN") return rootNavigation.navigate("Admin");
      if (user.role == "OWNER") return rootNavigation.navigate("Owner");
      if (user.role == "TENANT") return rootNavigation.navigate("Tenant");
    } catch (error: any) {
      console.log("Login Message: ", isLoginError);
      console.log("Login error in Catch: ", error);
      // Alert.alert("Login Failed: " + (error?.error.message || "Unknown error"));
      Alert.alert("Login Failed! Please Try Again.");
    }
  };

  const onPressSignup = () => {
    authNavitaion.navigate("SignUp");
  };
  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
      // loading={isLoginLoading}
      // error={[isLoginError ? "Failed to fetch user" : null]}
      variant="layout"
    >
      <VStack
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "green",
          justifyContent: "center",
          alignContent: "center",
          position: "relative",
        }}
      >
        <VStack
          style={{
            alignSelf: "center",
            width: "80%",
            zIndex: 2,
          }}
        >
          <HeaderLogo />
          {/* <Text
            style={{
              fontSize: 60,
              fontWeight: "900",
              fontFamily: "Poppins-Black",
              marginBottom: 20,
            }}
          >
            Boarding House Hunter
          </Text> */}
          <Surface
            elevation={3}
            style={{
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: "column",
                borderRadius: Spacing.base,
                gap: Spacing.base,
              }}
            >
              <View>
                <TextInput
                  label="Username"
                  mode="outlined"
                  value={username.value}
                  onChangeText={(text: string) =>
                    setUsername({ value: text, error: false })
                  }
                />
                <TextInput
                  label="Password"
                  mode="outlined"
                  secureTextEntry
                  value={password.value}
                  onChangeText={(text: string) =>
                    setPassword({ value: text, error: false })
                  }
                />
              </View>
              <View style={{ gap: Spacing.sm }}>
                <Button
                  onPress={onPressLogin}
                  mode="elevated"
                  style={{
                    borderRadius: BorderRadius.md,
                  }}
                >
                  <Text>Login</Text>
                </Button>
                <Divider />
                <Button
                  onPress={onPressSignup}
                  mode="elevated"
                  style={{
                    borderRadius: BorderRadius.md,
                  }}
                >
                  <Text>Dont have an Account?</Text>
                </Button>
              </View>
            </View>
          </Surface>
        </VStack>

        <Map
          data={[]}
          handleMarkerPress={() => {}}
          mapStyle={{
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 1,
          }}
          backdropStyle={{
            backgroundColor: "rgba(255,255,255,0.5)", // faded white
          }}
        ></Map>
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({});
