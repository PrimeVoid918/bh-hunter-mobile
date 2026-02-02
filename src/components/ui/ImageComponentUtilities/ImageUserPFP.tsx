import { View, Text, StyleSheet } from "react-native";
import React from "react";

interface ImageUserPFPInterface {
  height: number;
}

export default function ImageUserPFP({ height }: ImageUserPFPInterface) {
  return <View style={[s.container, { height: height }]}></View>;
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: "50%",
    aspectRatio: 1,
  },
});
