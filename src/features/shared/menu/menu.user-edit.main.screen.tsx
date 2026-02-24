import React, { useState, useEffect } from "react";
import { StyleSheet, Alert as AlertRN, View, Vibration } from "react-native";
import {
  Surface,
  TextInput,
  Button,
  Text,
  Avatar,
  useTheme,
  IconButton,
  Badge,
} from "react-native-paper";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import { GlobalStyle, Spacing } from "@/constants";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { computeProfileCompleteness } from "@/infrastructure/user/user.requirements.slice";
import { RootState } from "@/application/store/stores";

export default function MenuUserEditScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {
    id: authUserId,
    role: authUserRole,
    oneQuery,
    patchUser,
    fetchAndSelect,
    selectedUser,
  } = useDynamicUserApi();

  const completeness = useSelector(
    (state: RootState) => state.profileCompleteness,
  );
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      dispatch(
        computeProfileCompleteness({ role: authUserRole, user: selectedUser }),
      );
    }
  }, [selectedUser, authUserRole]);

  useEffect(() => {
    if (oneQuery?.data) setForm(oneQuery.data);
  }, [oneQuery?.data]);

  const onSave = async () => {
    Vibration.vibrate(10);
    setLoading(true);
    try {
      await patchUser(authUserId!, form);
      await fetchAndSelect(authUserId!);
      AlertRN.alert("Success", "Account updated!");
      navigation.goBack();
    } catch (error) {
      AlertRN.alert("Error", "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render section badge
  const SectionBadge = ({ count }: { count: number }) =>
    count > 0 ? (
      <Badge style={[s.sectionBadge, { backgroundColor: theme.colors.error }]}>
        {count}
      </Badge>
    ) : null;

  return (
    <StaticScreenWrapper style={GlobalStyle.GlobalsContainer}>
      <VStack space="lg" style={s.mainScroll}>
        {/* 1. PROFILE PHOTO */}
        <Box style={s.avatarContainer}>
          <Box>
            <Avatar.Image
              size={120}
              source={{
                uri: form?.profile_photo || "https://via.placeholder.com/150",
              }}
              style={{ backgroundColor: theme.colors.surfaceVariant }}
            />
            <IconButton
              icon="camera"
              mode="contained"
              containerColor={theme.colors.primary}
              iconColor="white"
              size={20}
              style={s.cameraBtn}
            />
          </Box>
          <Text style={s.roleLabel}>{authUserRole?.toUpperCase()}</Text>
        </Box>

        {/* 2. PERSONAL DETAILS GROUP */}
        <Surface elevation={0} style={s.containedGroup}>
          <View style={s.sectionHeader}>
            <Text style={[s.groupTitle, { color: theme.colors.primary }]}>
              Personal Details
            </Text>
            <SectionBadge
              count={completeness.sectionMissingCount.PERSONAL_DETAILS}
            />
          </View>

          <VStack space="md" style={s.fieldPadding}>
            <HStack space="md">
              <TextInput
                mode="outlined"
                label="First Name"
                style={s.flex1}
                value={form.firstname}
                onChangeText={(t) => setForm({ ...form, firstname: t })}
                error={!form.firstname} // Field level validation
              />
              <TextInput
                mode="outlined"
                label="Last Name"
                style={s.flex1}
                value={form.lastname}
                onChangeText={(t) => setForm({ ...form, lastname: t })}
                error={!form.lastname}
              />
            </HStack>
          </VStack>
        </Surface>

        {/* 3. ADDITIONAL INFO GROUP */}
        <Surface elevation={0} style={s.containedGroup}>
          <View style={s.sectionHeader}>
            <Text style={[s.groupTitle, { color: theme.colors.primary }]}>
              Additional Info
            </Text>
            <SectionBadge
              count={completeness.sectionMissingCount.ADDITIONAL_INFO || 0}
            />
          </View>

          <VStack space="md" style={s.fieldPadding}>
            <TextInput
              mode="outlined"
              label="Address"
              multiline
              value={form.address}
              onChangeText={(t) => setForm({ ...form, address: t })}
              error={!form.address}
            />

            <HStack space="md">
              <TextInput
                mode="outlined"
                label="Age"
                style={{ flex: 0.4 }}
                value={form.age?.toString()}
                keyboardType="numeric"
                onChangeText={(t) =>
                  setForm({ ...form, age: t ? parseInt(t) : undefined })
                }
                error={!form.age}
              />
              {"guardian" in form && (
                <TextInput
                  mode="outlined"
                  label="Guardian"
                  style={{ flex: 1 }}
                  value={form.guardian}
                  onChangeText={(t) => setForm({ ...form, guardian: t })}
                  error={!form.guardian}
                />
              )}
            </HStack>
          </VStack>
        </Surface>

        <VStack space="sm" style={s.actionArea}>
          <Button
            mode="contained"
            loading={loading}
            onPress={onSave}
            contentStyle={s.btnHeight}
          >
            Save Changes
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            textColor={theme.colors.error}
          >
            Discard Changes
          </Button>
        </VStack>
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainScroll: { paddingBottom: Spacing.lg },
  flex1: { flex: 1 },
  avatarContainer: { alignItems: "center", marginVertical: Spacing.lg },
  cameraBtn: {
    position: "absolute",
    bottom: -5,
    right: -5,
    margin: 0,
    borderWidth: 2,
    borderColor: "white",
  },
  roleLabel: {
    marginTop: Spacing.sm,
    fontFamily: "Poppins-Bold",
    fontSize: 10,
    letterSpacing: 2,
    color: "#767474",
  },
  containedGroup: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    backgroundColor: "#F7F9FC",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionBadge: { fontFamily: "Poppins-Bold" },
  groupTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fieldPadding: { padding: Spacing.base },
  actionArea: { marginTop: Spacing.base },
  btnHeight: { height: 52 },
});
