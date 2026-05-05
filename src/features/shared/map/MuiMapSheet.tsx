import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { View } from "@gluestack-ui/themed";
import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import {
  Portal,
  Surface,
  Text,
  Button,
  IconButton,
  useTheme,
  Modal,
  Chip,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const MapSheet = ({
  visible,
  data,
  usingUserLocation = false,
  onClose,
  onNavigate,
}) => {
  const theme = useTheme();
  const [fullscreenVisible, setFullscreenVisible] = React.useState(false);

  if (!visible || !data) return null;

  const thumbnailUrl =
    typeof data.thumbnail === "string"
      ? data.thumbnail
      : data.thumbnail?.url || data.thumbnail?.uri || null;

  const thumbnailImage = thumbnailUrl
    ? ({
        url: thumbnailUrl,
        uri: thumbnailUrl,
      } as any)
    : null;

  const isAvailable = Boolean(data.availabilityStatus);

  const priceText =
    data.price !== null && data.price !== undefined
      ? `₱${Number(data.price).toLocaleString()}`
      : "Price unavailable";

  const distanceText =
    typeof data.distance === "number"
      ? data.distance < 1000
        ? usingUserLocation
          ? `${Math.round(data.distance)} m from you`
          : `${Math.round(data.distance)} m from Ormoc center`
        : usingUserLocation
          ? `${(data.distance / 1000).toFixed(1)} km from you`
          : `${(data.distance / 1000).toFixed(1)} km from Ormoc center`
      : usingUserLocation
        ? "Distance from your location unavailable"
        : "Turn on location to calculate distance from you";

  console.log("mui data: ", data);

  return (
    <Portal>
      <Surface
        style={[s.sheet, { backgroundColor: theme.colors.surface }]}
        elevation={5}
      >
        <IconButton
          icon="close"
          size={18}
          style={s.closeBtn}
          onPress={onClose}
          mode="contained-tonal"
        />

        <View style={s.imageBox}>
          <PressableImageFullscreen
            image={thumbnailImage}
            removeFullScreenButton
            containerStyle={{ flex: 1 }}
            imageStyleConfig={{
              resizeMode: "cover",
              containerStyle: {
                borderRadius: 20,
              },
            }}
            noImageMessage="No boarding house image"
          />

          {thumbnailUrl && (
            <IconButton
              icon="image-search"
              size={18}
              mode="contained-tonal"
              style={s.fullscreenBtn}
              onPress={() => setFullscreenVisible(true)}
            />
          )}

          <View style={s.imageOverlay}>
            <Chip
              compact
              textStyle={s.chipText}
              style={[
                s.statusChip,
                {
                  backgroundColor: isAvailable
                    ? "rgba(22, 163, 74, 0.92)"
                    : "rgba(220, 38, 38, 0.92)",
                },
              ]}
            >
              {isAvailable ? "Available" : "Not Available"}
            </Chip>
          </View>
        </View>

        <View style={s.body}>
          <View>
            <Text
              variant="titleMedium"
              numberOfLines={2}
              style={[s.title, { color: theme.colors.onSurface }]}
            >
              {data.name}
            </Text>

            <View style={s.metaRow}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={16}
                color={theme.colors.outline}
              />
              <Text
                variant="bodySmall"
                numberOfLines={1}
                style={{ color: theme.colors.outline }}
              >
                {distanceText}
              </Text>
            </View>
          </View>

          <View style={s.footerRow}>
            <View>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.outline }}
              >
                Starts at
              </Text>
              <Text
                variant="titleMedium"
                style={[s.price, { color: theme.colors.primary }]}
              >
                {priceText}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={onNavigate}
              style={s.btn}
              contentStyle={s.btnContent}
            >
              View Details
            </Button>
          </View>
        </View>
      </Surface>

      <Modal
        visible={fullscreenVisible}
        onDismiss={() => setFullscreenVisible(false)}
        contentContainerStyle={s.fullscreenModal}
      >
        <IconButton
          icon="close"
          mode="contained-tonal"
          style={s.fullscreenClose}
          onPress={() => setFullscreenVisible(false)}
        />

        {thumbnailUrl && (
          <Pressable
            style={s.fullscreenImageWrap}
            onPress={() => setFullscreenVisible(false)}
          >
            <Image
              source={{ uri: thumbnailUrl }}
              style={s.fullscreenImage}
              resizeMode="contain"
            />
          </Pressable>
        )}
      </Modal>
    </Portal>
  );
};

const s = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 50,
    left: 16,
    right: 16,
    borderRadius: 28,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  closeBtn: {
    position: "absolute",
    top: -12,
    right: -8,
    zIndex: 20,
  },
  imageBox: {
    height: 150,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#EFEFEF",
  },
  fullscreenBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  imageOverlay: {
    position: "absolute",
    left: 10,
    bottom: 10,
  },
  statusChip: {
    borderRadius: 999,
  },
  chipText: {
    color: "white",
    fontFamily: "Poppins-Bold",
    fontSize: 11,
  },
  body: {
    paddingTop: 12,
    paddingHorizontal: 2,
    gap: 14,
  },
  title: {
    fontFamily: "Poppins-Bold",
    lineHeight: 22,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  price: {
    fontFamily: "Poppins-Bold",
  },
  btn: {
    borderRadius: 14,
  },
  btnContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenClose: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 20,
  },
  fullscreenImageWrap: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
});
