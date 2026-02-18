import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import React from "react";
import { GetRoom } from "@/infrastructure/room/rooms.schema";
import { HStack, VStack } from "@gluestack-ui/themed";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";

interface RoomsItemsProps {
  // key: string;
  data: GetRoom;
  children?: React.ReactNode;
}

export default function RoomsItems({ data, children }: RoomsItemsProps) {
  return (
    <HStack style={[s.container]}>
      {data && (
        <PressableImageFullscreen
          image={data?.thumbnail?.[0] ?? null}
          containerStyle={{ height: "auto", width: "35%" }}
          imageStyleConfig={{
            resizeMode: "cover",
            containerStyle: { borderRadius: 0 },
          }}
          removeFullScreenButton={true}
        />
      )}
      <VStack style={[s.container_def]}>
        <HStack style={[s.item_header]}>
          <HStack style={[{ alignItems: "flex-start", gap: Spacing.xs }]}>
            <Text style={[s.textColor, s.textBold, { fontSize: Fontsize.lg }]}>
              {data.roomNumber}
            </Text>
            <Text style={[{ color: Colors.TextInverse[3] }, s.textSm]}>
              {data.currentCapacity}/{data.maxCapacity}
            </Text>
          </HStack>
          <Text style={[s.textColor, s.textBold, { marginLeft: "auto" }]}>
            ₱{data.price}
          </Text>
        </HStack>
        <VStack style={[s.item_desc]}>
          <Text
            style={[s.textColor, s.textSm]}
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {data.description}
          </Text>
        </VStack>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 4, maxHeight: 20 }}
        >
          <HStack style={{ gap: 4 }}>
            {data.tags?.map((tag, i) => (
              <Text
                key={i}
                style={[s.textSm, { color: Colors.TextInverse[3] }]}
              >
                {tag}
              </Text>
            ))}
          </HStack>
        </ScrollView>
        <HStack style={[s.item_cta]}>
          {/* <Text
          style={[
            s.textColor,
            { marginLeft: "auto", fontSize: Fontsize.xs },
            s.textBold,
          ]}
        >
          Price: {data.price}
        </Text> */}
          {children}
        </HStack>
      </VStack>
    </HStack>
  );
}

const s = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    height: 150,
  },

  container_def: {
    flex: 1,
    padding: Spacing.sm,
    flexDirection: "column",
    alignContent: "flex-start",
  },

  item_header: {
    alignItems: "center",
  },

  item_desc: {},

  item_cta: {
    marginLeft: "auto",
    marginTop: "auto",
    padding: Spacing.xs,
    gap: Spacing.xs,
  },

  textColor: {
  },
  textSm: { fontSize: Fontsize.xs },
  textBold: {
    fontWeight: "900",
  },
});
