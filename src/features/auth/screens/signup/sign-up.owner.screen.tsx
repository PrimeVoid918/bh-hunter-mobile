import React, { useState } from "react";
import { StyleSheet, View, Alert, ScrollView } from "react-native";
import { Text, TextInput, Button, Surface, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import TermsAndServicesComponent from "@/components/ui/Policies/TermsAndServicesComponent";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/auth.stack.types";
import { useCreateMutation as useCreateOwner } from "@/infrastructure/owner/owner.redux.api";
import { RegisterOwner } from "@/infrastructure/owner/owner.types";

export default function SignUpOwnerScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [form, setForm] = useState<RegisterOwner>({
    username: "",
    password: "",
    email: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [createOwner, { isLoading }] = useCreateOwner();

  const handleInputChange = (field: keyof RegisterOwner, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert("Missing Fields", "Please fill in all information.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return false;
    }
    if (form.password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return false;
    }
    if (!hasAcceptedTerms) {
      Alert.alert(
        "Terms Required",
        "You must accept the legitimacy consent to proceed.",
      );
      return false;
    }
    return true;
  };

  async function handleSubmit() {
    if (!validate()) return;

    ReactNativeHapticFeedback.trigger("impactMedium");
    try {
      await createOwner(form).unwrap();
      ReactNativeHapticFeedback.trigger("notificationSuccess");
      Alert.alert("Success", "Your owner account has been created!");
      navigation.navigate("Login");
    } catch (error: any) {
      ReactNativeHapticFeedback.trigger("notificationError");
      Alert.alert("Error", error.data?.message || "Registration failed");
    }
  }

  return (
    <StaticScreenWrapper style={{ backgroundColor: theme.colors.background }}>
      {isLoading && <FullScreenLoaderAnimated />}

      <ScrollView
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text variant="headlineMedium" style={s.title}>
            Owner Application
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            Create your manager account for Ormoc City Boarding Houses
          </Text>
        </View>

        <Surface style={s.formCard} elevation={0}>
          <VStack style={{ gap: 16 }}>
            <TextInput
              label="Username"
              mode="outlined"
              value={form.username}
              onChangeText={(val) => handleInputChange("username", val)}
              left={<TextInput.Icon icon="account-outline" />}
              outlineStyle={s.inputOutline}
            />

            <TextInput
              label="Email Address"
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(val) => handleInputChange("email", val)}
              left={<TextInput.Icon icon="email-outline" />}
              outlineStyle={s.inputOutline}
            />

            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(val) => handleInputChange("password", val)}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              outlineStyle={s.inputOutline}
            />

            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              left={<TextInput.Icon icon="lock-check-outline" />}
              outlineStyle={s.inputOutline}
              error={
                confirmPassword !== "" && confirmPassword !== form.password
              }
            />
          </VStack>
        </Surface>

        <TermsAndServicesComponent
          value={hasAcceptedTerms}
          onChange={setHasAcceptedTerms}
        />

        <View style={s.actions}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={s.mainButton}
            contentStyle={{ height: 52 }}
            labelStyle={s.buttonLabel}
          >
            Create Account
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 8 }}
          >
            Already have an account? Log In
          </Button>
        </View>
      </ScrollView>
    </StaticScreenWrapper>
  );
}

const VStack = ({ children, style }: any) => (
  <View style={style}>{children}</View>
);

const s = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  inputOutline: {
    borderRadius: 10,
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  mainButton: {
    borderRadius: 12,
    elevation: 0,
  },
  buttonLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});
