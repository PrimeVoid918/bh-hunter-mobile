import { View, Text, Platform, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  Box,
  Button,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  VStack,
} from "@gluestack-ui/themed";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors, Fontsize, GlobalStyle, Spacing } from "@/constants";
import DecisionModal from "@/components/ui/DecisionModal";
import { useCreateBookingMutation } from "@/infrastructure/booking/booking.redux.api";
import { CreateBookingInput } from "@/infrastructure/booking/booking.schema";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TenantBookingStackParamList } from "../navigation/booking.types";
import { useSelector } from "react-redux";
import { RootState } from "@/application/store/stores";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import ScreenHeaderComponent from "../../../../../components/layout/ScreenHeaderComponent";
import UserInformatioCard from "@/components/ui/Information/UserInformatioCard";
import { useGetOneQuery } from "@/infrastructure/owner/owner.redux.api";

type RouteProps = RouteProp<TenantBookingStackParamList, "RoomsCheckoutScreen">;

export default function RoomsCheckoutScreen() {
  const route = useRoute<RouteProps>();
  const { roomId, ownerId } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<TenantBookingStackParamList>>();
  const tenantId = useSelector(
    (state: RootState) => state.tenants.selectedUser?.id,
  );

  const [showModal, setShowModal] = React.useState(false);
  const [createBooking, { isLoading, isError }] = useCreateBookingMutation();

  const [checkIn, setCheckIn] = React.useState(new Date());
  const [checkOut, setCheckOut] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1)), // default +1 month
  );

  if (!ownerId) {
    return <Text>Cound not Load the Informations!</Text>;
  }

  const { data: ownerData } = useGetOneQuery(ownerId);

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [hasAcceptedTerms1, setHasAcceptedTerms1] = useState(false);
  const [hasAcceptedTerms2, setHasAcceptedTerms2] = useState(false);
  const canSubmit = hasAcceptedTerms1 && hasAcceptedTerms2;

  const onCheckInChange = (_event: any, selectedDate?: Date) => {
    setShowCheckIn(Platform.OS === "ios");
    if (selectedDate) {
      setCheckIn(selectedDate);
      // Auto-calc check out 1 month after check-in
      const newCheckOut = new Date(selectedDate);
      newCheckOut.setMonth(newCheckOut.getMonth() + 1);
      setCheckOut(newCheckOut);
    }
  };

  const handleSaveChanges = async () => {
    if (!tenantId) return;
    if (!roomId) return;

    // if (!hasAcceptedTerms1 && !hasAcceptedTerms2) {
    //   Alert.alert(
    //     "Failed to create Booking Request: " +
    //   );
    // }

    const payload = {
      tenantId,
      startDate: checkIn.toISOString(),
      endDate: checkOut.toISOString(),
    };

    try {
      await createBooking({
        roomId: roomId,
        payload,
      }).unwrap();

      Alert.alert("Success", "Successfully created Booking Request!", [
        {
          text: "OK",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "BoardingHouseLists" }],
            }),
        },
      ]);
    } catch (error: any) {
      console.log("error:", error);
      Alert.alert(
        "Failed to create Booking Request: " +
          (error?.error || "Unknown error"),
      );
    }
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
    >
      {isLoading && <FullScreenLoaderAnimated />}
      <VStack style={{ flex: 1, padding: Spacing.md }}>
        <ScreenHeaderComponent text={{ textValue: "Reservation Request" }} />
        <VStack>
          <UserInformatioCard user={ownerData!}></UserInformatioCard>
        </VStack>
        <VStack style={{ gap: 4 }}>
          <Text style={{ fontWeight: "600" }}>Reservation Notes</Text>
          <Text>• Reservation locks the room for 1 month by default.</Text>
          <Text>
            • Final rent terms and payments are negotiated directly with the
            owner.
          </Text>
          <Text>
            • Make sure to communicate with the owner for check-in/out
            preferences.
          </Text>
        </VStack>
        <Box>
          <Text>
            Reservation Duration:{" "}
            {Math.ceil(
              (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
            )}{" "}
            days
          </Text>
        </Box>
      </VStack>
      <Checkbox
        value="terms1"
        isChecked={hasAcceptedTerms1}
        onChange={setHasAcceptedTerms1}
      >
        <CheckboxIndicator>
          <CheckboxIcon />
        </CheckboxIndicator>
        <CheckboxLabel>
          I understand this is a reservation intent and not a guaranteed
          booking.
        </CheckboxLabel>
      </Checkbox>

      <Checkbox
        value="terms2"
        isChecked={hasAcceptedTerms2}
        onChange={setHasAcceptedTerms2}
      >
        <CheckboxIndicator>
          <CheckboxIcon />
        </CheckboxIndicator>
        <CheckboxLabel>
          I agree that final arrangements are discussed directly with the owner.
        </CheckboxLabel>
      </Checkbox>
      <Box style={[{ marginTop: "auto" }]}>
        <Button onPress={() => setShowModal(true)} disabled={!canSubmit}>
          <Text style={[{}, s.textColor]}>Submit Reservation Request</Text>
        </Button>
      </Box>
      <DecisionModal
        visible={showModal}
        title="Confirm Date"
        message={`Are you sure about the Date?\n${checkIn.toDateString()} - ${checkOut.toDateString()}`}
        onCancel={() => setShowModal(false)}
        onConfirm={handleSaveChanges}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  button_text_style: {
    fontSize: Fontsize.xl,
  },

  textColor: {
    color: Colors.TextInverse[2],
  },
});
