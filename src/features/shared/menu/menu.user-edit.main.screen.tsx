import { StyleSheet, Alert as AlertRN, View } from "react-native";
import {
  Alert,
  Input,
  Button,
  InputField,
  Box,
  Text,
  HStack,
  VStack,
  FormControl,
  Heading,
  Avatar,
} from "@gluestack-ui/themed";
import React, { useState, useEffect } from "react";

// style
import {
  GlobalStyle,
  Colors,
  BorderRadius,
  Spacing,
  Fontsize,
} from "@/constants";

// layout
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// redux
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MenuStackParamList } from "./navigation/menu.stack.types";

//* custome redux hooks wrapper
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { Admin } from "@/infrastructure/admin/admin.types";
import { Owner } from "@/infrastructure/owner/owner.types";
import { Tenant } from "@/infrastructure/tenants/tenant.types";
import { UserRoleEnum, UserRole } from "@/infrastructure/user/user.types";

// TODO: abstract this 1
type UserFormType = Partial<Tenant> | Partial<Owner> | Partial<Admin>;
// TODO: abstract this 1

export default function MenuUserEditScreen() {
  const {
    id: authUserId,
    role: authUserRole,
    oneQuery,
    patchUser,
    fetchAndSelect,
  } = useDynamicUserApi();
  const isFocused = useIsFocused();
  const route = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();

  // TODO: Abstract this 1
  const [form, setForm] = useState<UserFormType>({});
  // TODO: Abstract this 1

  // TODO: Abstract this 1
  function cleanUserForm(role: UserRole | undefined, form: UserFormType) {
    const copy = { ...form };

    if (role === UserRoleEnum.TENANT) {
      delete (copy as any).boardingHouse;
      delete (copy as any).permits;
    }
    if (role === UserRoleEnum.OWNER) {
      delete (copy as any).guardian;
      delete (copy as any).boardingHouse;
      delete (copy as any).permits;
    }

    if (role === UserRoleEnum.ADMIN) {
      delete (copy as any).guardian;
    }

    return copy;
  }
  // TODO: Abstract this 1

  useEffect(() => {
    if (oneQuery?.data) {
      setForm(oneQuery.data);
    }
  }, [oneQuery?.data]);

  const [showSaveChangesConfirmModal, setShowSaveChangesConfirmModal] =
    useState(false);

  const handleCancelButton = () => {
    route.goBack();
  };

  const handleSaveChanges = async () => {
    try {
      const cleanForm = cleanUserForm(authUserRole, form);
      const id = authUserId;
      if (!id) {
        return;
      }
      const result = await patchUser(
        id,
        cleanForm as Partial<Tenant> | Partial<Owner> | Partial<Admin>,
      );
      await fetchAndSelect(id);
      // console.log("clanForm", cleanForm);

      // console.log("result", result);
      AlertRN.alert("Accound updated!");
      setTimeout(() => {
        setShowSaveChangesConfirmModal(false);
        route.goBack();
      });
    } catch (error) {
      console.log(error);
      AlertRN.alert("Error in saving changes!");
    }
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[
        GlobalStyle.GlobalsContentContainer,
        {
          padding: Spacing.lg,
          // paddingBottom: 80, // gives space for keyboard
          gap: Spacing.lg,
        },
      ]}
    >
      <VStack
        style={[
          {
            width: "100%",
            flex: 1,
            gap: Spacing.lg,
          },
        ]}
      >
        <Box style={[{ alignItems: "center" }]}>
          <Avatar style={[{ aspectRatio: 1, height: 150 }]}></Avatar>
        </Box>
        <Heading style={[s.Text, { fontSize: Fontsize.h2 }]}>
          Personal Details
        </Heading>
        <HStack
          style={[
            { width: "100%", justifyContent: "space-around", gap: Spacing.lg },
          ]}
        >
          <FormControl style={[s.FL]}>
            <FormControl.Label>
              <Text style={[s.Text]}>First Name</Text>
            </FormControl.Label>
            <Input>
              <InputField
                style={[s.TextInput]}
                value={form.firstname}
                placeholder={form.firstname}
                onChangeText={(text: string) =>
                  setForm({ ...form, firstname: text })
                }
              />
            </Input>
          </FormControl>
          <FormControl style={[s.FL]}>
            <FormControl.Label>
              <Text style={[s.Text]}>Last Name</Text>
            </FormControl.Label>
            <Input>
              <InputField
                style={[s.TextInput]}
                value={form.lastname}
                placeholder={form.lastname}
                onChangeText={(text: string) =>
                  setForm({ ...form, lastname: text })
                }
              />
            </Input>
          </FormControl>
        </HStack>
        <Box>
          <FormControl>
            <FormControl.Label>
              <Text style={[s.Text]}>Username</Text>
            </FormControl.Label>
            <Input>
              <InputField
                style={[s.TextInput]}
                value={form.username}
                placeholder={form.username}
                onChangeText={(text: string) =>
                  setForm({ ...form, username: text })
                }
              />
            </Input>
          </FormControl>
        </Box>
        {/* <Box>
          <FormControl>
            <FormControl.Label>
              <Text style={[s.Text]}>Password</Text>
            </FormControl.Label>
            <Input>
              <InputField
                style={[s.TextInput]}
                value={form.password}
                placeholder={form.password}
                // secureTextEntry
                onChangeText={(text: string) =>
                  setForm({ ...form, password: text })
                }
              />
            </Input>
          </FormControl>
        </Box> */}
        <Box>
          <FormControl>
            <FormControl.Label>
              <Text style={[s.Text]}>Phone Number</Text>
            </FormControl.Label>
            <Input>
              <InputField
                style={[s.TextInput]}
                value={form.phone_number}
                placeholder={form.phone_number}
                readOnly
                onChangeText={(text: string) =>
                  setForm({ ...form, phone_number: text })
                }
              />
            </Input>
          </FormControl>
        </Box>
        <Box>
          <FormControl>
            <FormControl.Label>
              <Text style={[s.Text]}>Email Address</Text>
            </FormControl.Label>
            <Input>
              <InputField
                style={[s.TextInput]}
                value={form.email}
                placeholder={form.email}
                onChangeText={(text: string) =>
                  setForm({ ...form, email: text })
                }
              />
            </Input>
          </FormControl>
        </Box>
        <Box>
          <FormControl>
            <FormControl.Label>
              <Text style={[s.Text]}>Age</Text>
            </FormControl.Label>
            <Input>
              <InputField
                style={[s.TextInput]}
                value={form.age?.toString()}
                readOnly
                onChangeText={(text: string) => {
                  if (text === "") {
                    setForm({ ...form, age: undefined });
                    return;
                  }

                  const parsed = Number(text);

                  if (!Number.isNaN(parsed)) {
                    setForm({ ...form, age: parsed });
                  }
                }}
              />
            </Input>
          </FormControl>
        </Box>
        <Box>
          <FormControl>
            <FormControl.Label>
              <Text style={[s.Text]}>Address</Text>
            </FormControl.Label>
            <Input>
              <InputField
                style={[s.TextInput]}
                value={form.address}
                placeholder={form.address}
                readOnly
                onChangeText={(text: string) =>
                  setForm({ ...form, address: text })
                }
              />
            </Input>
          </FormControl>
        </Box>
        {"guardian" in form && (
          <Box>
            <FormControl>
              <FormControl.Label>
                <Text style={[s.Text]}>Guardian</Text>
              </FormControl.Label>
              <Input>
                <InputField
                  style={[s.TextInput]}
                  value={form.guardian}
                  placeholder={form.guardian}
                  readOnly
                  onChangeText={(text: string) =>
                    setForm({ ...form, guardian: text })
                  }
                />
              </Input>
            </FormControl>
          </Box>
        )}
        <HStack
          style={[
            {
              width: "100%",
              justifyContent: "flex-end",
              gap: Spacing.lg,
              marginTop: "auto",
              marginBottom: "15%",
            },
          ]}
        >
          <Button onPress={handleCancelButton}>
            <Text>Cancel</Text>
          </Button>
          <Button onPress={() => setShowSaveChangesConfirmModal(true)}>
            <Text>Save</Text>
          </Button>
        </HStack>
      </VStack>
      {showSaveChangesConfirmModal && (
        <Alert
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
              alignItems: "center",
              width: "90%",
              padding: Spacing.lg,
              borderRadius: BorderRadius.md,
              // backgroundColor: Colors
            }}
          >
            <Heading>
              <Text style={[s.Text, { fontSize: Fontsize.h1 }]}>
                Save changes?
              </Text>
            </Heading>
            <Box>
              <Text style={[s.Text]}>Are you sure about the changes?</Text>
            </Box>
            <HStack>
              <Button
                mr="$3"
                action="negative"
                onPress={() => setShowSaveChangesConfirmModal(false)}
              >
                <Text style={[s.Text]}>Cancel</Text>
              </Button>
              <Button
                action="secondary"
                variant="outline"
                onPress={handleSaveChanges}
              >
                <Text style={[s.Text]}>Save Chnages</Text>
              </Button>
            </HStack>
          </VStack>
        </Alert>
      )}
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  border: {
    // borderColor: 'red',
    // borderWidth: 3
  },
  FL: {
    flex: 1,
  },
  Text: {
    color: Colors.TextInverse[2],
  },
  TextInput: {
    color: Colors.TextInverse[3],
  },
});
