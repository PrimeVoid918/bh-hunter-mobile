import { StyleSheet, Alert } from "react-native";
import React, { useState, useEffect } from "react";

import {
  Alert as AlertGL,
  HStack,
  Input,
  Box,
  FormControl,
  Text,
  VStack,
  InputField,
  Checkbox,
  CheckboxLabel,
  CheckboxIndicator,
  CheckboxIcon,
} from "@gluestack-ui/themed";
// import Ionicons from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-awesome-markdown";
import TermsAndConditions from "../../../../data/TermsAndConditions";

// ui
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// UI components
import Button from "@/components/ui/Button";

// Global Styles
import {
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
  BorderRadius,
} from "@/constants";

// routing
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/auth.stack.types";

// api
import { Heading } from "@gluestack-ui/themed";
import { ScrollView } from "@gluestack-ui/themed";

// redux
import { useCreateMutation as useCreateTenant } from "@/infrastructure/tenants/tenant.redux.api";
import { RegisterTenant, Tenant } from "@/infrastructure/tenants/tenant.types";

export default function SignUpTenantScreen() {
  // const api = new Api();
  const route = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  // const [loading, setLoading] = React.useState(false);
  const [tenantForm, setTenantForm] = useState<RegisterTenant>({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<{
    value: string;
    isTrue: boolean;
  }>({ value: "", isTrue: false });
  const [createTenant, { isLoading: isCreating, error: createError }] =
    useCreateTenant();

  const handleFormSubmit = async () => {
    for (const [key, value] of Object.entries(tenantForm)) {
      if (!value.trim()) {
        Alert.alert("Missing Field", `Please fill in the ${key}`);
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(tenantForm.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (tenantForm.password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters");
      return;
    }
    if (tenantForm.password !== confirmPassword.value) {
      Alert.alert("Alert", "Password and Confirm Password must match");
      return;
    }

    if (hasAcceptedTerms !== true) {
      return Alert.alert(
        "You must accept the Terms and Conditions to create an account!"
      );
    }

    try {
      // const res: any = await api.tenant.create(tenantForm);

      const result = await createTenant(tenantForm).unwrap();
      console.log("result", result);

      Alert.alert("You are registered!");
      setTenantForm({
        username: "",
        email: "",
        password: "",
      });
      setConfirmPassword({ value: "", isTrue: false });
      route.navigate("Login");
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.data.message);
    }
  };

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [termsModal, setTermsModal] = useState(false);

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.StaticScreenWrapper]}
      contentContainerStyle={[
        GlobalStyle.GlobalsContentContainer,
        { justifyContent: "center", alignContent: "stretch" },
      ]}
    >
      <VStack style={[s.container, { marginBottom: 100, marginTop: 100 }]}>
        <Heading
          style={{ color: Colors.TextInverse[1], fontSize: Fontsize.h2 }}
        >
          Create Account as a Tenant
        </Heading>
        <FormControl>
          <FormControl.Label>
            <Text style={[s.FormLabel]}>Username</Text>
          </FormControl.Label>
          <Input>
            <InputField
              value={tenantForm.username}
              onChangeText={(text: string) =>
                setTenantForm({ ...tenantForm, username: text })
              }
              style={[s.FormTextInput]}
            />
          </Input>
        </FormControl>
        <FormControl>
          <FormControl.Label>
            <Text style={[s.FormLabel]}>Email</Text>
          </FormControl.Label>
          <Input>
            <InputField
              value={tenantForm.email}
              onChangeText={(text: string) =>
                setTenantForm({ ...tenantForm, email: text })
              }
              keyboardType="email-address"
              style={[s.FormTextInput]}
            />
          </Input>
        </FormControl>
        <FormControl>
          <FormControl.Label>
            <Text style={[s.FormLabel]}>Password</Text>
          </FormControl.Label>
          <Input>
            <InputField
              value={tenantForm.password}
              onChangeText={(text: string) =>
                setTenantForm({ ...tenantForm, password: text })
              }
              style={[s.FormTextInput]}
              secureTextEntry={true}
            />
          </Input>
        </FormControl>
        <FormControl>
          <FormControl.Label>
            <Text style={[s.FormLabel]}>Confirm Password</Text>
          </FormControl.Label>
          <Input>
            <InputField
              value={confirmPassword.value}
              onChangeText={(text: string) =>
                setConfirmPassword({ ...confirmPassword, value: text })
              }
              style={[s.FormTextInput]}
              secureTextEntry={true}
            />
          </Input>
        </FormControl>
        <VStack>
          <Checkbox
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 20,
              gap: 10,
            }}
            isChecked={hasAcceptedTerms}
            onPress={() => setTermsModal(true)}
            value="accepted"
          >
            <CheckboxIndicator style={{ aspectRatio: 1, height: 100 }}>
              <CheckboxIcon
                as={() => (
                  <Ionicons
                    name={hasAcceptedTerms ? "checkmark" : "checkmark-outline"}
                    color={"black"}
                  />
                )}
              />
            </CheckboxIndicator>
            <CheckboxLabel style={{ color: Colors.TextInverse[1] }}>
              I agree to the Terms and Conditions
            </CheckboxLabel>
          </Checkbox>
          <HStack style={{ marginTop: 20 }}>
            <Button
              title="Cancel"
              onPressAction={() => {
                route.navigate("Login");
              }}
              containerStyle={{
                backgroundColor: Colors.Alert,
                padding: 10,
              }}
            />
            <Button
              title="Create"
              onPressAction={handleFormSubmit}
              containerStyle={{
                backgroundColor: "white",
                padding: 10,
              }}
              textStyle={{
              }}
            />
          </HStack>
        </VStack>
      </VStack>
      {termsModal && (
        <AlertGL
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <VStack
            style={{
              gap: Spacing.lg,
              alignItems: "stretch",
              width: "90%",
              padding: Spacing.lg,
              borderRadius: BorderRadius.md,
            }}
          >
            <Heading>
              <Text style={[s.Text, { fontSize: Fontsize.h1 }]}>
                Terms and Services
              </Text>
            </Heading>
            <ScrollView>
              <Markdown styles={customStyles} text={TermsAndConditions} />
            </ScrollView>
            <VStack>
              <Button
                variant="primary"
                onPressAction={() => {
                  setTermsModal(false);
                  setHasAcceptedTerms(false);
                }}
              >
                <Text style={[s.TextButton]}>
                  I Do Not Accept the Terms and Services
                </Text>
              </Button>
              <Button
                variant="primary"
                onPressAction={() => {
                  setTermsModal(false);
                  setHasAcceptedTerms(true);
                }}
              >
                <Text style={[s.TextButton]}>
                  I Accept the Terms and Services
                </Text>
              </Button>
            </VStack>
          </VStack>
        </AlertGL>
      )}
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  StaticScreenWrapper: {
  },
  container: {
    width: "90%",
    alignSelf: "center",
  },
  FormLabel: {
    fontSize: Fontsize.base,
    padding: Spacing.sm,
  },
  FormTextInput: {
    fontSize: Fontsize.base,
    padding: Spacing.xs,
    margin: 0,
  },
  Text: {
  },
  TextInput: {
  },
  TextButton: {
    color: "black",
  },
});

const customStyles = {
  paragraph: { color: "white" },
  h1: { color: "white" },
  h2: { color: "white" },
  h3: { color: "white" },
  h4: { color: "white" },
  h5: { color: "white" },
  h6: { color: "white" },
  link: { color: "white", textDecorationLine: "underline" },
  blockquote: { color: "white", fontStyle: "italic" },
  list: { color: "white" },
  strong: { color: "white" },
  em: { color: "white" },
  code: { color: "white", backgroundColor: "#333" },
};
