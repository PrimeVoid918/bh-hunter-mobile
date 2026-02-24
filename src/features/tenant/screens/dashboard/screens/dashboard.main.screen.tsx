import { View, Text, StyleSheet, Pressable } from "react-native";
import { Box, Button } from "@gluestack-ui/themed";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

import {
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
  BorderRadius,
} from "@/constants";
import { VStack } from "@gluestack-ui/themed";

// redux
// import { useDispatch } from "react-redux";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import HeroComponent from "../components/HeroComponent";
import { TenantDashboardStackParamList } from "../navigation/dashboard.stack";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import VerificationIndicatorComponent from "@/components/ui/Verification/VerificationIndicatorComponent";

export default function DashboardMainScreen() {
  // const dispatch = useDispatch();
  const { selectedUser: user } = useDynamicUserApi();

  const navigation =
    useNavigation<NativeStackNavigationProp<TenantDashboardStackParamList>>();

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.StaticScreenWrapper]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
    >
      <View>
        <Pressable
          onPress={() => navigation.navigate("VerificationMainScreen")}
        >
          <VerificationIndicatorComponent
            onPress={() => {
              navigation.navigate("VerificationMainScreen");
            }}
            isVerified={user?.isVerified!}
          />
        </Pressable>
      </View>
      <VStack
        style={{
          gap: Spacing.lg,
        }}
      >
        <HeroComponent></HeroComponent>
        <VStack style={[s.Hero]}>
          <Text style={[s.Hero_text1]}> Hello {user?.firstname}!</Text>
          {/* <Text style={[s.Hero_text1]}> Discover Places Around You!</Text> */}
        </VStack>
        <VStack style={[s.Widget]}>
          <Button
            style={[s.Widget_item]}
            onPress={() => navigation.navigate("DashboardBookingStack")}
          >
            <Text style={[s.generic_text_lg]}>Bookings</Text>
          </Button>
          <Button style={[s.Widget_item]}>
            <Text style={[s.generic_text_lg]}>Bookmarks</Text>
          </Button>
          <Button style={[s.Widget_item]}>
            <Text style={[s.generic_text_lg]}>Booking History</Text>
          </Button>
          {/* <Button style={[s.Widget_item]}>
            <Text style={[s.generic_text_lg]}>Nearby Houses</Text>
          </Button> */}
          <Button style={[s.Widget_item]}>
            <Text style={[s.generic_text_lg]}>Notifications</Text>
          </Button>
        </VStack>
        <Box>“3 new boarding houses near you!” [Explore Nearby]</Box>
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  StaticScreenWrapper: {
    // backgroundColor: Colors.
    padding: 10,
  },
  Hero: {
    // borderColor: "red",
    // borderWidth: 3,
  },
  Hero_text1: {
    fontSize: Fontsize.h2,
    fontWeight: "bold",
    color: Colors.TextInverse[2],
  },
  Widget: {
    // borderColor: 'red',
    // borderWidth: 3
    gap: 10,
  },
  Widget_item: {
    // borderColor: 'green',
    // borderWidth: 3,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 10,
    height: 50,
    width: "100%",
    // backgroundColor: Colors.
  },

  generic_text_sm: {
    fontSize: Fontsize.sm,
    color: Colors.TextInverse[2],
  },
  generic_text_md: {
    fontSize: Fontsize.md,
    color: Colors.TextInverse[2],
  },
  generic_text_lg: {
    fontSize: Fontsize.lg,
    color: Colors.TextInverse[2],
  },
});
