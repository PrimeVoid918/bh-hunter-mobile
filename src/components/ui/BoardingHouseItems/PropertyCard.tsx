import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { HStack, VStack } from "@gluestack-ui/themed";
import {
  GetBoardingHouse,
  QueryBoardingHouse,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import { Colors, Fontsize, Spacing } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import PressableImageFullscreen from "../ImageComponentUtilities/PressableImageFullscreen";
import { formatNumberWithCommas } from "@/infrastructure/utils/string.formatter.util";

interface PropertyCardProps {
  data: GetBoardingHouse;
  children?: React.ReactNode;
}

export default function PropertyCard({ data, children }: PropertyCardProps) {
  return (
    <HStack style={[s.container]}>
      {data && (
        <>
          <PressableImageFullscreen
            removeFullScreenButton
            image={data?.thumbnail?.[0] ?? null}
            containerStyle={{ height: 120, aspectRatio: 4 / 3 }}
            imageStyleConfig={{
              resizeMode: "cover",
              containerStyle: { borderRadius: 0 },
            }}
          />
        </>
      )}
      <HStack style={[s.container_def]}>
        <HStack>
          <Text style={[s.generic_text_md]}>{data.name}</Text>
          <Text
            style={[
              {
                fontSize: Fontsize.xs,
                color: Colors.TextInverse[1],
                fontWeight: "900",
              },
              { marginLeft: "auto" },
            ]}
          >
            ₱{formatNumberWithCommas(data.priceRange?.lowestPrice!)} - ₱
            {formatNumberWithCommas(data.priceRange?.highestPrice!)}
          </Text>
        </HStack>
        <HStack>
          <HStack style={{ alignItems: "center" }}>
            <Ionicons name={"star"} color="white" size={Fontsize.xs} />
            <Text style={[s.generic_text_xs]}> {data.rooms?.length}</Text>
          </HStack>
          <Text style={[s.generic_text_xs, { marginLeft: "auto" }]}>
            {data.rooms?.length} {data.rooms?.length == 1 ? "room" : "rooms"}
          </Text>
        </HStack>
        <HStack style={[s.ameneity_style]}>
          {data.amenities?.map((amenity, i) => (
            <HStack style={[s.ameneity_style_item]} key={i}>
              <Text
                style={[s.generic_text_xs, { color: Colors.TextInverse[3] }]}
              >
                {amenity}
              </Text>
            </HStack>
          ))}
        </HStack>
        <HStack style={[{ marginTop: "auto", marginLeft: "auto" }]}>
          <View>{children}</View>
        </HStack>
      </HStack>
    </HStack>
  );
}

const s = StyleSheet.create({
  container: {
    width: "100%", // ensure full width
    overflow: "hidden",
    flexDirection: "row", // since you use HStack
    borderRadius: Spacing.md,
    backgroundColor: Colors.PrimaryLight[9],
    // optional: height: 180,
  },

  container_def: {
    flex: 1,
    padding: Spacing.sm,
    flexDirection: "column",
    gap: 2,
  },
  ameneity_style: {
    gap: 2,
  },
  ameneity_style_item: {
    backgroundColor: Colors.PrimaryLight[100],
    borderRadius: Spacing.xs,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.sm,
  },

  generic_text_xs: {
    fontSize: Fontsize.xs,
    color: Colors.TextInverse[1],
  },
  generic_text_sm: {
    fontSize: Fontsize.sm,
    color: Colors.TextInverse[1],
  },
  generic_text_md: {
    fontSize: Fontsize.md,
    color: Colors.TextInverse[1],
    fontWeight: "900",
  },
  generic_text_lg: {
    fontSize: Fontsize.lg,
    color: Colors.TextInverse[2],
  },
});

// create a card or container a ....
