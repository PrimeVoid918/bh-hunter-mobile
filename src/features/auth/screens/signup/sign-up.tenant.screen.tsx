import React, { useState } from "react";
import { StyleSheet, View, Alert, ScrollView } from "react-native";
import { Text, TextInput, Button, Surface, useTheme } from "react-native-paper";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import TermsAndServicesComponent from "@/components/ui/Policies/TermsAndServicesComponent";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/auth.stack.types";
import { useCreateMutation as useCreateTenant } from "@/infrastructure/tenants/tenant.redux.api";
import { RegisterTenant } from "@/infrastructure/tenants/tenant.types";

export default function SignUpTenantScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [tenantForm, setTenantForm] = useState<RegisterTenant>({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const [createTenant, { isLoading: isCreating }] = useCreateTenant();

  const handleInputChange = (field: keyof RegisterTenant, value: string) => {
    setTenantForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!tenantForm.username || !tenantForm.email || !tenantForm.password) {
      Alert.alert("Missing Fields", "Please complete the form.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(tenantForm.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }
    if (tenantForm.password.length < 6) {
      Alert.alert("Security", "Password must be at least 6 characters.");
      return false;
    }
    if (tenantForm.password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return false;
    }
    if (!hasAcceptedTerms) {
      Alert.alert(
        "Legal Action Required",
        "Please accept both the Terms and the Legitimacy Consent.",
      );
      return false;
    }
    return true;
  };

  const handleFormSubmit = async () => {
    if (!validate()) return;

    ReactNativeHapticFeedback.trigger("impactMedium");
    try {
      await createTenant(tenantForm).unwrap();
      ReactNativeHapticFeedback.trigger("notificationSuccess");
      Alert.alert("Success", "Account created! Welcome to BH-Hunter.");
      navigation.navigate("Login");
    } catch (error: any) {
      ReactNativeHapticFeedback.trigger("notificationError");
      Alert.alert(
        "Registration Failed",
        error.data?.message || "Something went wrong",
      );
    }
  };

  return (
    <StaticScreenWrapper style={{ backgroundColor: theme.colors.background }}>
      {isCreating && <FullScreenLoaderAnimated />}

      <ScrollView
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text variant="headlineMedium" style={s.title}>
            Tenant Registration
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            Join the Ormoc City boarding house community.
          </Text>
        </View>

        <Surface style={s.formCard} elevation={0}>
          <View style={{ gap: 16 }}>
            <TextInput
              label="Username"
              mode="outlined"
              value={tenantForm.username}
              onChangeText={(val) => handleInputChange("username", val)}
              outlineStyle={s.inputOutline}
              left={<TextInput.Icon icon="account-circle-outline" />}
            />

            <TextInput
              label="Email"
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              value={tenantForm.email}
              onChangeText={(val) => handleInputChange("email", val)}
              outlineStyle={s.inputOutline}
              left={<TextInput.Icon icon="email-outline" />}
            />

            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry={!showPassword}
              value={tenantForm.password}
              onChangeText={(val) => handleInputChange("password", val)}
              outlineStyle={s.inputOutline}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              outlineStyle={s.inputOutline}
              left={<TextInput.Icon icon="lock-check-outline" />}
              error={
                confirmPassword !== "" &&
                confirmPassword !== tenantForm.password
              }
            />
          </View>
        </Surface>

        <View style={s.legalSection}>
          <TermsAndServicesComponent
            value={hasAcceptedTerms}
            onChange={setHasAcceptedTerms}
          />
        </View>

        <View style={s.actions}>
          <Button
            mode="contained"
            onPress={handleFormSubmit}
            style={s.mainButton}
            contentStyle={{ height: 54 }}
            labelStyle={s.buttonLabel}
          >
            Create Tenant Account
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 8 }}
          >
            Back to Login
          </Button>
        </View>
      </ScrollView>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: 50,
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
    marginBottom: 10,
  },
  inputOutline: {
    borderRadius: 10,
  },
  legalSection: {
    marginVertical: 10,
  },
  actions: {
    marginTop: 20,
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
