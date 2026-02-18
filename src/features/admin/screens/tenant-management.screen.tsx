import { View, Text, StyleSheet, Alert as AlertRN } from "react-native";
import {
  Alert,
  Box,
  HStack,
  VStack,
  Heading,
  Button as ButtonRN,
  FormControl,
  Input,
  InputField,
  Pressable,
} from "@gluestack-ui/themed";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

import {
  BorderRadius,
  Colors,
  GlobalStyle,
  Spacing,
  Fontsize,
} from "../../../constants/index";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

import Api from "@/services/apiEndpoints";
import { ScrollView } from "react-native-gesture-handler";

import Button from "@/components/ui/Button";
import { useGetAllQuery } from "@/infrastructure/tenants/tenant.redux.slice";

interface User {
  id: string | number | undefined;
  username: string | undefined;
  firstname: string | undefined;
  lastname: string | undefined;
  email: string | undefined;
  password: string | undefined;
  role: string | undefined;
  isActive: string | undefined;
  isVerified: string | undefined;
  createdAt: string | undefined;

  age: string | undefined;
  phone_number: string | undefined;
  address: string | undefined;
  guardian?: string | undefined;
}

interface AddUserProps {
  username: string | undefined;
  firstname: string | undefined;
  lastname: string | undefined;
  email: string | undefined;
  password: string | undefined;

  age: string | undefined;
  phone_number: string | undefined;
  address: string | undefined;
  guardian?: string | undefined;
}

const AdminTenantManagementScreen = () => {
  const { data: tenantsArray, isLoading, isError } = useGetAllQuery();

  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "",
    isActive: "",
    isVerified: "",
    createdAt: "",
    age: "",
    phone_number: "",
    address: "",
    guardian: "",
  });
  const handleEditUser = async (userId: string | number) => {
    try {
      console.log("Edit user:", userId);
      AlertRN.alert("Accound updated!");
    } catch (error) {
      console.log(error);
      AlertRN.alert("Error in saving changes!");
    }
  };

  const handleDeleteUser = async (userId: string | number) => {
    try {
      console.log("Delete user:", userId);
      AlertRN.alert("Accound Deleted!");
    } catch (error) {
      console.log(error);
      AlertRN.alert("Error in Deleting User!");
    }
  };

  const [addUserModal, setAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",

    age: "",
    phone_number: "",
    address: "",
    guardian: "",
  });

  const handleAddUser = async () => {
    for (const [key, value] of Object.entries(addUserForm)) {
      if (!value.trim()) {
        AlertRN.alert("Missing Field", `Please fill in the ${key}`);
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(addUserForm?.email)) {
      AlertRN.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (addUserForm?.password.length < 6) {
      AlertRN.alert(
        "Invalid Password",
        "Password must be at least 6 characters"
      );
      return;
    }
    try {
      AlertRN.alert("Accound updated!");
      setAddUserForm({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",

        age: "",
        phone_number: "",
        address: "",
        guardian: "",
      });
      setAddUserModal(false);
    } catch (error) {
      console.log(error);
      AlertRN.alert("Error in Adding Tenant!");
    }
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
    >
      <ScrollView>
        <Box
          style={{
            gap: Spacing.md,
            padding: Spacing.md,
          }}
        >
          {tenantsArray?.map((tenant) => (
            <HStack
              key={tenant.id}
              style={{
                // borderColor: 'red',
                // borderWidth: 3,
                padding: Spacing.md,
                borderRadius: BorderRadius.md,
              }}
            >
              <VStack>
                <Heading>
                  <Text style={[s.Text]}>{tenant.username}</Text>
                </Heading>
                <HStack>
                  <Text style={[s.Text]}>{tenant.firstname} </Text>
                  <Text style={[s.Text]}>{tenant.lastname}</Text>
                </HStack>
              </VStack>
              <HStack
                style={{
                  marginLeft: "auto",
                  alignItems: "center",
                  gap: Spacing.md,
                }}
              >
                {/* {String(user.isVerified) == 'false' && (
                  <ButtonRN style={{backgroundColor: 'green'}} onPress={()=>handleApproveUser(user.id)}>
                    <Text style={[s.Text]}>Approve</Text>
                  </ButtonRN>
                )} */}
                <ButtonRN
                  onPress={() => {
                    setEditModal(true);
                    // setSelectedUser(tenant);
                    // setEditForm(user);
                  }}
                >
                  <Ionicons name="pencil" size={20} />
                </ButtonRN>
                <ButtonRN
                  style={{ backgroundColor: "red" }}
                  // onPress={() => handleDeleteUser(user.id)}
                >
                  <Ionicons name="trash" size={20} />
                </ButtonRN>
              </HStack>
            </HStack>
          ))}
        </Box>
      </ScrollView>
      {editModal && (
        <Alert
          style={{
            position: "absolute",
            top: "65%",
            left: "50%",
            transform: `translate(-50%, -50%)`,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <VStack
            style={{
              gap: Spacing.lg,
              // alignItems: 'stretch',
              height: 500,
              width: "90%",
              padding: Spacing.lg,
              borderRadius: BorderRadius.md,
            }}
          >
            <Heading>
              <Text style={[s.Text, { fontSize: Fontsize.h1 }]}>Edit User</Text>
            </Heading>
            <ScrollView>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Username</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={editForm?.username}
                    onChangeText={(text: string) =>
                      setEditForm({ ...editForm, username: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Firstname</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={editForm?.firstname}
                    onChangeText={(text: string) =>
                      setEditForm({ ...editForm, firstname: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Lastname</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={editForm?.lastname}
                    onChangeText={(text: string) =>
                      setEditForm({ ...editForm, lastname: text })
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
                    value={editForm?.email}
                    onChangeText={(text: string) =>
                      setEditForm({ ...editForm, email: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Age</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={String(editForm?.age)}
                    onChangeText={(text: string) =>
                      setEditForm({ ...editForm, age: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Phone Number</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={editForm?.phone_number}
                    onChangeText={(text: string) =>
                      setEditForm({ ...editForm, phone_number: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Home Address</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={editForm?.address}
                    onChangeText={(text: string) =>
                      setEditForm({ ...editForm, address: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Guardian</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={editForm?.guardian}
                    onChangeText={(text: string) =>
                      setEditForm({ ...editForm, guardian: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>

              <FormControl style={{ paddingTop: 20 }}>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Role</Text>
                </FormControl.Label>
                <Text style={[s.FormTextInput]}>{editForm?.role}</Text>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Verified</Text>
                </FormControl.Label>
                <Text style={[s.FormTextInput]}>
                  {String(editForm?.isVerified)}
                </Text>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Active</Text>
                </FormControl.Label>
                <Text style={[s.FormTextInput]}>
                  {String(editForm?.isActive)}
                </Text>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Created At</Text>
                </FormControl.Label>
                <Text style={[s.FormTextInput]}>
                  {String(editForm?.createdAt)}
                </Text>
              </FormControl>
            </ScrollView>
            <VStack>
              <Button
                variant="primary"
                onPressAction={() => {
                  setEditModal(false);
                }}
              >
                <Text style={[s.TextButton]}>Cancel</Text>
              </Button>
              <Button
                variant="primary"
                onPressAction={() => {
                  setEditModal(false);
                  // handleEditUser(selectedUser?.id);
                }}
              >
                <Text style={[s.TextButton]}>Save</Text>
              </Button>
            </VStack>
          </VStack>
        </Alert>
      )}
      {/* -----------------Add Owner ------------------------------------------------------------------------------------------------------------ */}
      <Button
        variant="primary"
        onPressAction={() => {
          setAddUserModal(true);
        }}
        containerStyle={{
          position: "absolute",
          bottom: 25,
          right: 25,
          width: 50,

        }}
      >
        <Ionicons name="add-outline" size={20} color={Colors.PrimaryLight[7]} />
      </Button>
      {addUserModal && (
        <Alert
          style={{
            position: "absolute",
            top: "65%",
            left: "50%",
            transform: `translate(-50%, -50%)`,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0)",
          }}
        >
          <VStack
            style={{
              gap: Spacing.lg,
              height: 500,
              width: "90%",
              padding: Spacing.lg,
              borderRadius: BorderRadius.md,
            }}
          >
            <Pressable
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                borderRadius: "10%",
                aspectRatio: 1 / 1,
                height: 30,
                padding: 0,

                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setAddUserModal(false)}
            >
              <Ionicons name="close" size={30} />
            </Pressable>
            <Heading>
              <Text style={[s.Text, { fontSize: Fontsize.h1 }]}>
                Add Tenant
              </Text>
            </Heading>
            <ScrollView>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Username</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={addUserForm.username}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, username: text })
                    }
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
                    value={addUserForm.password}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, password: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Firstname</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={addUserForm.firstname}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, firstname: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Lastname</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={addUserForm.lastname}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, lastname: text })
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
                    value={addUserForm.email}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, email: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Age</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={String(addUserForm.age)}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, age: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Phone Number</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={addUserForm.phone_number}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, phone_number: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Home Address</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={addUserForm.address}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, address: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Guardian</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={addUserForm.guardian}
                    onChangeText={(text: string) =>
                      setAddUserForm({ ...addUserForm, guardian: text })
                    }
                    style={[s.FormTextInput]}
                  />
                </Input>
              </FormControl>
            </ScrollView>
            <VStack>
              <Button
                variant="primary"
                onPressAction={() => {
                  handleAddUser();
                }}
                containerStyle={{ backgroundColor: Colors.PrimaryLight[3] }}
              >
                <Text style={[s.TextButton]}>Add Tenant</Text>
              </Button>
            </VStack>
          </VStack>
        </Alert>
      )}
      {/* -----------------Add Owner ------------------------------------------------------------------------------------------------------------ */}
    </StaticScreenWrapper>
  );
};

const s = StyleSheet.create({
  FormLabel: {
    fontSize: Fontsize.base,
    paddingTop: Spacing.sm,
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

export default AdminTenantManagementScreen;
