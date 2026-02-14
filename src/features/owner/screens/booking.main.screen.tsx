import { View, Text, StyleSheet } from "react-native";
import { Box } from "@gluestack-ui/themed";
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
import Ionicons from "react-native-vector-icons/Ionicons";

export default function BookingMainScreen(){
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
        <VStack style={[s.Hero]}>
          <Ionicons name="book-outline" color="white" size={50} />
          <Text style={[s.Hero_text1]}>Bookings</Text>
        </VStack>
        <VStack style={[s.Widget]}>
          <Box style={[s.Widget_item]}>
            <Ionicons name="notifications" color="white" size={25} />
            <Text style={[s.generic_text_lg]}>
              Total Properties
            </Text>
          </Box>
          <Box style={[s.Widget_item]}>
            <Ionicons name="build-outline" color="white" size={25} />
            <Text style={[s.generic_text_lg]}>...</Text>
          </Box>
        </VStack>
      </VStack>
    </StaticScreenWrapper>
  );
};

const s = StyleSheet.create({
  StaticScreenWrapper: {
    // backgroundColor: Colors.PrimaryLight[8],
    padding: 10,
  },
  Hero: {
    justifyContent: "center",
    alignItems: "center",
  },
  Hero_text1: {
    fontSize: Fontsize.h1,
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
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    alignItems: "center",
    padding: 10,
    height: 50,
    width: "100%",
    backgroundColor: Colors.PrimaryLight[9],
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
