import { View, Text } from "react-native";
import React from "react";
import { Box, HStack } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import AutoExpandingInput from "../AutoExpandingInputComponent";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants";

export default function ReviewInput() {
  return (
    <Box>
      <Text style={[s.text_color]}>Add a Review:</Text>
      <HStack style={{ borderWidth: 3, borderColor: "yellow" }}>
        <Text>Rating: </Text>
        <HStack
          style={[
            {
              gap: 8,
            },
          ]}
        >
          <Ionicons name="star" size={20} color="gold" />
          <Ionicons name="star" size={20} color="gold" />
          <Ionicons name="star" size={20} color="gold" />
          <Ionicons name="star" size={20} color="gold" />
          <Ionicons name="star-half" size={20} color="gold" />
          <Text>(4.0)</Text>
        </HStack>
      </HStack>
      <AutoExpandingInput
        value="Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt sequi maiores ex, sunt recusandae aliquam totam vero repellat quaerat quas accusantium nam eos fugit rem laudantium fugiat consequatur iste nihil."
        onChangeText={() => {}}
        containerStyle={{ borderWidth: 2 }}
        maxHeight={140}
        style={{ color: Colors.TextInverse[1] }}
      />
    </Box>
  );
}

const s = StyleSheet.create({
  text_color: {
    color: Colors.TextInverse[1],
  },
});
