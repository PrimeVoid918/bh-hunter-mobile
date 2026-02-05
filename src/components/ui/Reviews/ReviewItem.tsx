import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { Box, HStack } from "@gluestack-ui/themed";
import { Colors, Fontsize, Spacing } from "@/constants";
import ImageUserPFP from "../ImageComponentUtilities/ImageUserPFP";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import RatingsStarStatic from "../Ratings/RatingsStarStatic";
import { Review } from "@/infrastructure/reviews/reviews.schema";
import { parseIsoDate } from "@/infrastructure/utils/parseISODate.util";

interface ReviewItemInterface {
  review: Review;
  starFilledColor: string;
  starHollowedColor: string;
}

export default function ReviewItem({
  review,
  starFilledColor,
  starHollowedColor,
}: ReviewItemInterface) {
  const dateDisplay = parseIsoDate(review.createdAt)?.dateOnlyDashed;
  //TODO: make a smart day measurement`

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
          <ImageUserPFP height={30}></ImageUserPFP>
        </View>
        <Box style={[s.commentor_nameContainer]}>
          <HStack style={{ alignItems: "center", gap: Spacing.sm }}>
            <Text style={[s.text_color, s.commentor_name]}>
              {review.tenant.username}
            </Text>
            <Text style={[s.text_color, { fontSize: Fontsize.xs }]}>
              {dateDisplay}
            </Text>
          </HStack>
          <RatingsStarStatic
            star={review.rating}
            starFilledColor={starFilledColor}
            starHollowedColor={starHollowedColor}
          ></RatingsStarStatic>
        </Box>
        {/* <Pressable
          onPress={() => {
            console.log("pressed the options!");
          }}
          style={{
            padding: Spacing.xs,
            marginLeft: "auto",
            justifyContent: "center",
          }}
        >
          <SimpleLineIcons
            name="options-vertical"
            size={25}
            color={Colors.TextInverse[1]}
          />
        </Pressable> */}
      </HStack>
      <Text
        style={[
          { paddingLeft: Spacing.lg, paddingTop: Spacing.md },
          s.text_color,
        ]}
      >
        {review.comment}
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
    // gap: Spacing.md,
    // borderWidth: 3,
    borderColor: "green",
  },
  commentor_name: {
    fontWeight: "900",
    fontSize: Fontsize.lg,
  },
});
