import { StyleSheet, ImageStyle, Alert } from "react-native";
import { View, Text } from "@gluestack-ui/themed";

import React, { useState, useEffect } from "react";
// UI Layout
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// UI comopnent
import TextInput from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";

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

  useEffect(() => {
    setTimeout(() => {
      onPressLogin();
    }, 700);
  }, []);

  const onPressLogin = async () => {
    // const packageLoad = {
    //   username: username.value,
    //   password: password.value,
    // };

    const packageLoad = {
      username: "owner1",
      password: "owner1",
    };
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
      wrapInScrollView
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[
        GlobalStyle.GlobalsContentContainer,
        {
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      {isLoginLoading && <FullScreenLoaderAnimated />}
      <View style={[s.Container]}>
        <Text
          style={{
            fontSize: 60,
            color: "white",
            fontWeight: 900,
            marginBottom: 20,
          }}
        >
          Boarding House Hunter
        </Text>
        <View style={[s.Form]}>
          <View style={[s.Form_Inputs]}>
            <TextInput
              placeholder="username"
              iconName="person"
              variant="primary"
              value={username.value}
              onChangeText={(text) =>
                setUsername({ value: text, error: false })
              }
              containerStyle={s.Form_InputContainer}
              textInputStyle={s.Form_InputText}
              iconStyle={s.Form_InputIcon}
            />
            <TextInput
              variant="primary"
              iconName="lock-closed"
              placeholder="password"
              value={password.value}
              onChangeText={(text) =>
                setPassword({ value: text, error: false })
              }
              containerStyle={s.Form_InputContainer}
              textInputStyle={s.Form_InputText}
              iconStyle={s.Form_InputIcon}
              secureTextEntry={true}
            />
          </View>
          <View style={[s.Form_Buttons]}>
            <Button
              title="Login"
              variant="primary"
              onPressAction={onPressLogin}
              textStyle={s.Form_Bottons_Login_Text}
            ></Button>
            <Button
              title="Dont have an Account?"
              containerStyle={s.Form_Bottons_Signup_Container}
              textStyle={s.Form_Bottons_Signup_Text}
              onPressAction={onPressSignup}
            ></Button>
          </View>
        </View>
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  default: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PrimaryLight[9],
    // width: '100%',
    // borderColor: 'yellow',
    // borderWidth: 3
  },
  Container: {
    backgroundColor: "transparent",
    flex: 1,
    width: "90%",

    position: "relative",

    justifyContent: "center",
    alignItems: "center",

    // borderColor: 'yellow',
    // borderWidth: 3,
  },

  logo_Container: {
    alignSelf: "stretch",
    top: undefined,
    position: undefined,
    padding: 0,
    left: 0,
    right: 0,
  },
  logo_Image: {
    height: 125,
  } as ImageStyle,

  Form: {
    height: 300,
    width: "90%",

    backgroundColor: Colors.PrimaryLight[7],
    borderColor: Colors.PrimaryLight[5],
    borderWidth: BorderWidth.lg,
    borderRadius: BorderRadius.xl,

    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.base,

    ...ShadowLight.xxl,
  },
  Form_Inputs: {
    // borderColor: 'blue',
    // borderWidth: 6,
    width: "100%",
    gap: 12,
  },
  Form_InputContainer: {
    backgroundColor: Colors.PrimaryLight[2],
  },
  Form_InputIcon: {
    color: Colors.PrimaryLight[8],
  },
  Form_InputText: {
    fontSize: Fontsize.lg,
    padding: Spacing.xs,
  },
  Form_Buttons: {
    marginTop: "auto",
    // flex: 1,
    justifyContent: "flex-start",
    alignSelf: "stretch",
    alignItems: "center",
  },
  Form_Bottons_Login_Container: {
    borderColor: "green",
    borderWidth: 3,
    flex: 1,
    alignSelf: "stretch",
    width: "100%",
  },
  Form_Bottons_Login_Text: {
    color: Colors.Text[2],
    fontSize: Fontsize.h3,
    fontWeight: "700",
  },
  Form_Bottons_Signup_Container: {
    borderWidth: 0,
    margin: 0,
    padding: 0,
    backgroundColor: "transparent",
    textDecorationLine: "underline",
    height: "auto",
  },
  Form_Bottons_Signup_Text: {
    margin: 0,
    padding: 0,
    color: Colors.Text[5],
    fontSize: Fontsize.md,
    fontWeight: 100,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent dark background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // ensure it's above everything
  },
});
