import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { Box, HStack } from "@gluestack-ui/themed";
import { Colors, Fontsize, Spacing } from "@/constants";
import ImageUserPFP from "../ImageComponentUtilities/ImageUserPFP";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import RatingsStar from "../Ratings/RatingsStarStatic";

export default function ReviewItem() {
  return (
    <Box style={[{ padding: Spacing.sm }, s.comment_container]}>
      <HStack style={{ alignItems: "stretch" }}>
        <View
          style={[
            {
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <ImageUserPFP height={40}></ImageUserPFP>
        </View>
        <Box style={[s.commentor_nameContainer]}>
          <HStack style={{ alignItems: "center", gap: Spacing.sm }}>
            <Text style={[s.text_color, s.commentor_name]}>
              FirstName Lastname
            </Text>
            <Text style={[s.text_color, { fontSize: Fontsize.xs }]}>
              yyyy-mm-dd
            </Text>
          </HStack>
          <RatingsStar></RatingsStar>
        </Box>
        <Pressable
          onPress={() => {
            console.log("pressed the options!");
          }}
          style={{
            padding: Spacing.xs,
            // backgroundColor: Colors.PrimaryLight[1],
            marginLeft: "auto",
            justifyContent: "center",
          }}
        >
          <SimpleLineIcons
            name="options-vertical"
            size={25}
            color={Colors.TextInverse[1]}
          />
        </Pressable>
      </HStack>
      <Text
        style={[
          { paddingLeft: Spacing.md, paddingTop: Spacing.xs },
          s.text_color,
        ]}
      >
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium
        enim doloremque qui ad, repudiandae doloribus sit modi ut! Ad enim
        deserunt consequatur odit eligendi recusandae maxime temporibus. In,
        officia optio.
      </Text>
    </Box>
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
