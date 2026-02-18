import { StyleSheet } from "react-native";
import React from "react";

import { HStack, View, Text, VStack } from "@gluestack-ui/themed";

// UI layout
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// UI Component
import Button from "@/components/ui/Button";

// Global Styles
import {
  Colors,
  GlobalStyle,
} from "@/constants";

// routing
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/auth.stack.types";

export default function SignUpSuccessScreen() {
  const route = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  async function handleSubmit() {
    route.navigate("Login");
  }

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.StaticScreenWrapper]}
      contentContainerStyle={[
        GlobalStyle.GlobalsContentContainer,
        { justifyContent: "center", alignContent: "stretch" },
      ]}
    >
      <View style={[s.container]}>
        <View>
          <Text
            style={{
              color: Colors.TextInverse[1],
              fontSize: 40,
              alignSelf: "center",
              marginBottom: 40,
            }}
          >
            Thank you! Your application is under review. We’ll contact you soon
            via email.
          </Text>
        </View>

        <VStack>
          <HStack style={{ marginTop: 10 }}>
            <Button title="Ok" onPressAction={handleSubmit} />
          </HStack>
        </VStack>
      </View>
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
