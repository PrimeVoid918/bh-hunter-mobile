import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import AutoExpandingInput from "../AutoExpandingInputComponent";
import { Box, HStack } from "@gluestack-ui/themed";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { Colors, Fontsize, Spacing } from "@/constants";
import ReviewItem from "./ReviewItem";
import ReviewInput from "./ReviewInput";

interface ReviewSectionInterface {}

export default function ReviewSection({}: ReviewSectionInterface) {
  return (
    <View style={[, s.container]}>
      <ReviewInput></ReviewInput>

      <ReviewItem></ReviewItem>
      <ReviewItem></ReviewItem>
      <ReviewItem></ReviewItem>
      <ReviewItem></ReviewItem>
      <ReviewItem></ReviewItem>
      <ReviewItem></ReviewItem>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderColor: "red",
  },
  text_color: {
    color: Colors.TextInverse[1],
  },

  comment_container: {
    // borderWidth: 4,
  },
  commentor_nameContainer: {
    marginLeft: Spacing.md,
    // borderWidth: 4,
  },
  commentor_name: {
    fontWeight: "900",
    fontSize: Fontsize.xl,
  },
});
