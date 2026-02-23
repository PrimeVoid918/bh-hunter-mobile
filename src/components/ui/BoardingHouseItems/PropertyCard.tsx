import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Badge, useTheme, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { GetBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import { Colors, Fontsize, Spacing, BorderRadius } from "@/constants";
import PressableImageFullscreen from "../ImageComponentUtilities/PressableImageFullscreen";
import { formatNumberWithCommas } from "@/infrastructure/utils/string.formatter.util";

interface PropertyCardProps {
  data: GetBoardingHouse;
  children?: React.ReactNode;
}

export default function PropertyCard({ data, children }: PropertyCardProps) {
  const theme = useTheme();

  return (
    <Card style={s.card} mode="elevated">
      <View style={s.row}>
        {/* 1. Thumbnail Section */}
        <View style={s.imageContainer}>
          <PressableImageFullscreen
            removeFullScreenButton
            image={data?.thumbnail?.[0] ?? null}
            containerStyle={s.image}
            imageStyleConfig={{
              resizeMode: "cover",
            }}
          />
          {/* Availability Badge Overlay */}
          <Badge
            style={[
              s.badge,
              {
                backgroundColor: data.availabilityStatus
                  ? "#10b981"
                  : "#ef4444",
              },
            ]}
            size={10}
          />
        </View>

        {/* 2. Content Section */}
        <View style={s.content}>
          <View style={s.headerRow}>
            <Text variant="titleMedium" numberOfLines={1} style={s.title}>
              {data.name}
            </Text>
          </View>

          <View style={s.infoRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" numberOfLines={1} style={s.subText}>
              {data.address || "No address set"}
            </Text>
          </View>

          <View style={s.priceRow}>
            <Text variant="labelLarge" style={s.priceText}>
              ₱{formatNumberWithCommas(data.priceRange?.lowestPrice!)}
              <Text variant="bodySmall"> - </Text>₱
              {formatNumberWithCommas(data.priceRange?.highestPrice!)}
            </Text>
          </View>



          {/* 3. Amenities (Limited to 3 for clean UI) */}
          {/* <View style={s.amenityRow}>
            {data.amenities?.slice(0, 3).map((amenity, i) => (
              <View key={i} style={s.amenityTag}>
                <Text style={s.amenityText}>{amenity}</Text>
              </View>
            ))}
            {(data.amenities?.length ?? 0) > 3 && (
              <Text style={s.moreText}>+{data.amenities!.length - 3}</Text>
            )}
          </View> */}

          {/* 4. Action Area */}
          <View style={s.footer}>
            <View style={s.stats}>
              <Ionicons
                name="bed-outline"
                size={14}
                color={theme.colors.primary}
              />
              <Text variant="labelSmall" style={s.statText}>
                {data.rooms?.length || 0} Rooms
              </Text>
            </View>
            <View>{children}</View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "white",
    marginVertical: 4,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    height: 140,
  },
  imageContainer: {
    width: "35%",
    position: "relative",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  content: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    color: "#1c1b1f",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: -4,
  },
  subText: {
    color: "#49454f",
    flex: 1,
  },
  priceRow: {
    marginTop: 4,
  },
  priceText: {
    color: Colors.Primary[700],
    fontWeight: "700",
  },
  amenityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  amenityTag: {
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amenityText: {
    fontSize: 10,
    color: "#49454f",
  },
  moreText: {
    fontSize: 10,
    color: "#79747e",
    alignSelf: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "#1d1b20",
  },
});
