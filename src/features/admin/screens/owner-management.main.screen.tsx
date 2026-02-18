import {
  View,
  Text,
  StyleSheet,
  Alert as AlertRN,
  Pressable,
} from "react-native";
import {
  Button as ButtonGL,
  Alert,
  Box,
  HStack,
  VStack,
  Heading,
  Button as ButtonRN,
  FormControl,
  Input,
  InputField,
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

import { ScrollView } from "react-native-gesture-handler";

import Button from "@/components/ui/Button";

// redux
import { RootState } from "@/stores";
import { useGetAllQuery } from "@/infrastructure/tenants/tenant.redux.api";

export default function OwnerManagementMainScreen() {
  const { data: ownersArray, isLoading, isError } = useGetAllQuery();

  const [addOwnerModal, setAddOwnerModal] = useState(false);
  const [addOwnerForm, setAddOwnerForm] = useState({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    email: "",
    age: "",
    phone_number: "",
    address: "",
  });

  const handleDeleteApplication = async (userId: string | number) => {
    try {
      const result = await api.owner_applicants.delete(selectedUser.id);
      fetchUsers();
      console.log("Delete user:", userId);
      AlertRN.alert("Accound Deleted!");
    } catch (error) {
      console.log(error);
      AlertRN.alert("Error in saving changes!");
    }
  };

  const handleAddOwner = async () => {
    for (const [key, value] of Object.entries(addOwnerForm)) {
      if (!value.trim()) {
        AlertRN.alert("Missing Field", `Please fill in the ${key}`);
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(addOwnerForm.email)) {
      AlertRN.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (addOwnerForm.password.length < 6) {
      AlertRN.alert(
        "Invalid Password",
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      // const {confirmPassword: _, ...filtered} = addOwnerForm
      console.log("Owner Sucessfull Added");
      AlertRN.alert("Owner Sucessfull Added");
      // setAddOwnerForm({
      //   username: "",
      //   password: "",
      //   firstname: "",
      //   lastname: "",
      //   email: "",
      //   age: "",
      //   phone_number: "",
      //   address: "",
      // });
      setAddOwnerModal(false);
    } catch (error) {
      console.log(error);
      AlertRN.alert("Error in adding owner!");
    }
  };

  const handleUpdateUser = async (userId: string | number) => {
    try {
      console.log("Owner Sucessfull Added");
      AlertRN.alert("Owner Sucessfull Added");
      // setSelectedUser({
      //   username: "",
      //   password: "",
      //   firstname: "",
      //   lastname: "",
      //   email: "",
      //   age: "",
      //   phone_number: "",
      //   address: "",
      // });
      setAddOwnerModal(false);
    } catch (error) {
      console.log(error);
      AlertRN.alert("Error in adding owner!");
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
          {ownersArray?.map((owner) => (
            <HStack
              key={owner.id}
              style={{
                padding: Spacing.md,
                borderRadius: BorderRadius.md,
              }}
            >
              <VStack>
                <Heading>
                  <Text style={[s.Text]}>{owner.username}</Text>
                </Heading>
                <HStack>
                  <Text style={[s.Text]}>{owner.firstname} </Text>
                  <Text style={[s.Text]}>{owner.lastname}</Text>
                </HStack>
              </VStack>
              <HStack
                style={{
                  marginLeft: "auto",
                  alignItems: "center",
                  gap: Spacing.md,
                }}
              >
                {String(owner?.isVerified) === "false" ? (
                  <ButtonRN style={{ backgroundColor: Colors.Alert }}>
                    <Text style={[s.Text, { color: "black" }]}>Pending</Text>
                  </ButtonRN>
                ) : (
                  <ButtonRN style={{ backgroundColor: Colors.Success }}>
                    <Text style={[s.Text, { color: "white" }]}>Approved</Text>
                  </ButtonRN>
                )}
                <ButtonRN
                  onPress={() => {

                  }}
                ></ButtonRN>
              </HStack>
            </HStack>
          ))}
        </Box>
      </ScrollView>
      {/* -----------------Add Owner ------------------------------------------------------------------------------------------------------------ */}
      <Button
        variant="primary"
        onPressAction={() => {
          setAddOwnerModal(true);
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
      {addOwnerModal && (
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
              onPress={() => setAddOwnerModal(false)}
            >
              <Ionicons name="close" size={30} />
            </Pressable>
            <Heading>
              <Text style={[s.Text, { fontSize: Fontsize.h1 }]}>Add Owner</Text>
            </Heading>
            <ScrollView>
              <FormControl>
                <FormControl.Label>
                  <Text style={[s.FormLabel]}>Username</Text>
                </FormControl.Label>
                <Input>
                  <InputField
                    value={addOwnerForm.username}
                    onChangeText={(text: string) =>
                      setAddOwnerForm({ ...addOwnerForm, username: text })
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
                    value={addOwnerForm.password}
                    onChangeText={(text: string) =>
                      setAddOwnerForm({ ...addOwnerForm, password: text })
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
                    value={addOwnerForm.firstname}
                    onChangeText={(text: string) =>
                      setAddOwnerForm({ ...addOwnerForm, firstname: text })
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
                    value={addOwnerForm.lastname}
                    onChangeText={(text: string) =>
                      setAddOwnerForm({ ...addOwnerForm, lastname: text })
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
                    value={addOwnerForm.email}
                    onChangeText={(text: string) =>
                      setAddOwnerForm({ ...addOwnerForm, email: text })
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
                    value={addOwnerForm.age}
                    onChangeText={(text: string) =>
                      setAddOwnerForm({ ...addOwnerForm, age: text })
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
                    value={addOwnerForm.phone_number}
                    onChangeText={(text: string) =>
                      setAddOwnerForm({ ...addOwnerForm, phone_number: text })
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
                    value={addOwnerForm.address}
                    onChangeText={(text: string) =>
                      setAddOwnerForm({ ...addOwnerForm, address: text })
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
                  handleAddOwner();
                }}
              >
                <Text style={[s.TextButton]}>Add Owner</Text>
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
