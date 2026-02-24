import React, { useState } from "react";
import { StyleSheet, Vibration, Alert } from "react-native";
import {
  Surface,
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  IconButton,
} from "react-native-paper";
import { VStack, Box, HStack } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";

import { GlobalStyle, Spacing } from "@/constants";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";

export default function MenuAccountSecurityScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { selectedUser, oneQuery, patchUser, id } = useDynamicUserApi();

  const [form, setForm] = useState({
    username: selectedUser?.username || "",
    phone_number: selectedUser?.phone_number || "",
    password: "",
    confirmPassword: "",
  });

  const [secureEntry, setSecureEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleActionFeedback = () => Vibration.vibrate(10);

  const handleSave = async () => {
    handleActionFeedback();

    // Strict Phone Validation (Mimicking PH number without 3rd party)
    if (
      form.phone_number.length !== 11 ||
      !form.phone_number.startsWith("09")
    ) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 11-digit number starting with 09.",
      );
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Patching logic
      await patchUser(id!, {
        username: form.username,
        phone_number: form.phone_number,
        ...(form.password ? { password: form.password } : {}),
      });
      Alert.alert(
        "Security Updated",
        "Your credentials have been saved successfully.",
      );
      navigation.goBack();
    } catch (e) {
      Alert.alert(
        "Update Failed",
        "This username or phone number may already be in use.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaticScreenWrapper style={GlobalStyle.GlobalsContainer}>
      <VStack space="lg" style={s.container}>
        {/* INFO CALLOUT */}
        <Surface
          elevation={0}
          style={[
            s.infoBox,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <HStack space="sm" style={{ alignItems: "center" }}>
            <IconButton
              icon="shield-check"
              iconColor={theme.colors.onPrimaryContainer}
              size={24}
            />
            <Box style={{ flex: 1 }}>
              <Text
                style={[
                  s.infoTitle,
                  { color: theme.colors.onPrimaryContainer },
                ]}
              >
                Critical Credentials
              </Text>
              <Text
                style={[s.infoDesc, { color: theme.colors.onPrimaryContainer }]}
              >
                Changes to these fields affect how you log in and how others
                identify you.
              </Text>
            </Box>
          </HStack>
        </Surface>

        {/* CREDENTIALS GROUP */}
        <Surface elevation={0} style={s.containedGroup}>
          <VStack space="md" style={s.padding}>
            {/* USERNAME */}
            <TextInput
              mode="outlined"
              label="Username"
              value={form.username}
              onChangeText={(t) =>
                setForm({ ...form, username: t.toLowerCase().trim() })
              }
              left={<TextInput.Affix text="@" />}
              autoCapitalize="none"
            />

            {/* STRICT PHONE NUMBER */}
            <Box>
              <TextInput
                mode="outlined"
                label="Phone Number"
                placeholder="09XXXXXXXXX"
                value={form.phone_number}
                keyboardType="phone-pad"
                maxLength={11}
                onChangeText={(t) =>
                  setForm({ ...form, phone_number: t.replace(/[^0-9]/g, "") })
                }
                right={
                  form.phone_number.length === 11 ? (
                    <TextInput.Icon
                      icon="check-circle"
                      color={theme.colors.success}
                    />
                  ) : null
                }
              />
              <HelperText type="info" visible={form.phone_number.length < 11}>
                Required: 11 digits (e.g., 09123456789)
              </HelperText>
            </Box>
          </VStack>
        </Surface>

        {/* PASSWORD GROUP */}
        <Surface elevation={0} style={s.containedGroup}>
          <VStack space="md" style={s.padding}>
            <Text style={s.subHeading}>Change Password</Text>

            <TextInput
              mode="outlined"
              label="New Password"
              secureTextEntry={secureEntry}
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
              right={
                <TextInput.Icon
                  icon={secureEntry ? "eye" : "eye-off"}
                  onPress={() => setSecureEntry(!secureEntry)}
                />
              }
            />

            <TextInput
              mode="outlined"
              label="Confirm New Password"
              secureTextEntry={secureEntry}
              value={form.confirmPassword}
              onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
              error={
                form.password !== "" &&
                form.confirmPassword !== "" &&
                form.password !== form.confirmPassword
              }
            />
          </VStack>
        </Surface>

        {/* ACTION BUTTON */}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          contentStyle={s.btnContent}
          style={s.saveBtn}
        >
          Update Credentials
        </Button>
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { paddingBottom: 40 },
  padding: { padding: Spacing.base },
  infoBox: {
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  infoTitle: { fontFamily: "Poppins-Bold", fontSize: 14 },
  infoDesc: { fontFamily: "Poppins-Regular", fontSize: 12, lineHeight: 16 },
  containedGroup: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  subHeading: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#767474",
    marginBottom: 4,
  },
  saveBtn: {
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  btnContent: { height: 54 },
});
