import { View, Text, StyleSheet } from "react-native";
import { Box } from "@gluestack-ui/themed";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect } from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

import {
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
  BorderRadius,
} from "@/constants";
import { VStack } from "@gluestack-ui/themed";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Owner } from "@/infrastructure/owner/owner.types";
import { Button } from "@react-navigation/elements";

// navigation
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PropertiesStackParamList } from "./navigation/properties.stack.types";
import ScreenHeaderComponent from "@/components/layout/ScreenHeaderComponent";

export default function PropertiesMainScreen() {
  const propertyNavigation =
    useNavigation<NativeStackNavigationProp<PropertiesStackParamList>>();

  const isFocused = useIsFocused();
  const { selectedUser: data } = useDynamicUserApi();
  const user = data as Owner;

  // useEffect(() => {
  //   refetch();
  // }, [isFocused]);

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.StaticScreenWrapper]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
    >
      <VStack
        style={{
          // justifyContent: "center",
          // alignItems: "center",
          gap: Spacing.lg,
        }}
      >
        <ScreenHeaderComponent text={{ textValue: "Properties" }} />
        <VStack style={[s.Widget]}>
          <Box style={[s.Widget_item]}>
            <Ionicons name="notifications" color="white" size={25} />
            <Text style={[s.generic_text_lg]}>
              Total Properties {user.boardingHouses?.length ?? 0}
            </Text>
          </Box>
          <Box style={[s.Widget_item]}>
            <Ionicons name="build-outline" color="white" size={25} />
            <Text style={[s.generic_text_lg]}>...</Text>
          </Box>
        </VStack>
        <Button onPress={() => propertyNavigation.navigate("PropertyCreate")}>
          <Text>Add Property</Text>
        </Button>
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  StaticScreenWrapper: {
    padding: Spacing.md,
  },
  Hero: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  Hero_text1: {
    fontSize: Fontsize.h1,
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    alignItems: "center",
    padding: 10,
    height: 50,
    width: "100%",
  },

  generic_text_sm: {
    fontSize: Fontsize.sm,
  },
  generic_text_md: {
    fontSize: Fontsize.md,
  },
  generic_text_lg: {
    fontSize: Fontsize.lg,
  },
});
