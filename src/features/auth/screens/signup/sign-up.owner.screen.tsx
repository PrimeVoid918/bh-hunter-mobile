import { StyleSheet, Alert, FlatList } from "react-native";
import React, { useState, useEffect } from "react";

import {
  Button as ButtonGL,
  Alert as AlertGL,
  HStack,
  View,
  Input,
  Box,
  FormControl,
  Heading,
  ScrollView,
  Text,
  VStack,
  InputField,
  Checkbox,
  CheckboxLabel,
  CheckboxIndicator,
  CheckboxIcon,
} from "@gluestack-ui/themed";
import Ionicons from "react-native-vector-icons/Ionicons";
import Markdown from "react-native-awesome-markdown";
import TermsAndConditions from "../../../../data/TermsAndConditions";

// UI layout
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// UI Component
import Button from "@/components/ui/Button";

// Global Styles
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";

// routing
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/auth.stack.types";
import { RegisterOwner } from "@/infrastructure/owner/owner.types";
import { useCreateMutation as useCreateTenant } from "@/infrastructure/owner/owner.redux.api";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";

export default function SignUpOwnerScreen() {
  const route = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [form, setForm] = useState<RegisterOwner>({
    username: "",
    password: "",
    email: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<{
    value: string;
    isTrue: boolean;
  }>({ value: "", isTrue: false });
  const [createOwner, { isLoading: isLoading, error: isError }] =
    useCreateTenant();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit() {
    for (const [key, value] of Object.entries(form)) {
      if (!value.trim()) {
        Alert.alert("Missing Field", `Please fill in the ${key}`);
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters");
      return;
    }
    if (form.password !== confirmPassword.value) {
      Alert.alert("Alert", "Password and Confirm Password must match");
      return;
    }

    if (hasAcceptedTerms !== true) {
      return Alert.alert(
        "You must accept the Terms and Conditions to create an account!"
      );
    }

    try {
      const result = await createOwner(form).unwrap();
      console.log("result", result);

      Alert.alert("You are registered!");
      setForm({
        username: "",
        password: "",
        email: "",
      });
      setConfirmPassword({ value: "", isTrue: false });
      route.navigate("Login");
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.data.message);
    }
  }

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
      {isLoading && <FullScreenLoaderAnimated></FullScreenLoaderAnimated>}
      <View style={[s.container, { marginBottom: 100, marginTop: 100 }]}>
        <View>
          <Text
            style={{
              color: Colors.TextInverse[1],
              fontSize: Fontsize.h1,
            }}
          >
            Owner Application Form
          </Text>
        </View>
        <View>
          {["username", "email"].map((field) => (
            <View key={field}>
              <Text
                style={{
                  fontSize: Fontsize.base,
                  color: Colors.TextInverse[1],
                  padding: Spacing.sm,
                }}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </Text>
              <Input>
                <InputField
                  value={form[field as keyof typeof form]}
                  onChangeText={(text) => handleChange(field, text)}
                  variant="secondary"
                  textInputStyle={{
                    fontSize: Fontsize.base,
                    padding: Spacing.xs,
                    margin: 0,
                  }}
                  style={[s.FormTextInput]}
                />
              </Input>
            </View>
          ))}
          <View style={{ width: "100%", padding: 10 }}></View>
          <FormControl>
            <FormControl.Label>
              <Text style={[s.FormLabel]}>Password</Text>
            </FormControl.Label>
            <Input>
              <InputField
                value={form.password}
                onChangeText={(text: string) =>
                  setForm({ ...form, password: text })
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
        </View>
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
              textStyle={{
                color: Colors.PrimaryLight[9],
              }}
            />
            <Button
              title="Create"
              onPressAction={handleSubmit}
              containerStyle={{
                backgroundColor: "white",
                padding: 10,
                // borderColor: Colors.Primary[7],
              }}
              textStyle={{
                color: Colors.Primary[9],
              }}
            />
          </HStack>
        </VStack>
      </View>
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
  Text: {
    color: "white",
  },
  TextButton: {
    color: "black",
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
