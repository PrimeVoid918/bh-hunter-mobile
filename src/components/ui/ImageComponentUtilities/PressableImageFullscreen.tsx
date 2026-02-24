import {
  Text,
  Pressable,
  Alert,
  Image,
  StyleSheet,
  ImageStyle,
  StyleProp,
  ViewStyle,
  ColorValue,
  ImageResizeMode,
} from "react-native";
import React from "react";
import { AppImageFile } from "@/infrastructure/image/image.schema";
import { IoniconsIconType } from "@/constants/icons/IonIconsTypes";
import { useImageFullScreenModal } from "./GlobalImageFullScreenProvider";
import { Box } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";

interface PressableImageFullscreenProps {
  removeFullScreenButton?: boolean;
  image?: AppImageFile | null;
  noImageMessageColor?: ColorValue;
  noImageMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorImageMessageColor?: ColorValue;
  imageStyleConfig?: {
    imageStyleProps?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    resizeMode?: ImageResizeMode;
  };
  fullscreenIconStyleConfig?: {
    fullscreenIconSize?: number;
    fullscreenIconColor?: ColorValue;
    fullscreenIconName?: IoniconsIconType;
    fullscreenIconContainerStyle?: StyleProp<ViewStyle>;
  };
  alt?: string;
}

export default function PressableImageFullscreen({
  removeFullScreenButton = false,
  image,
  noImageMessageColor = "#888",
  noImageMessage = "No image",
  containerStyle = {},
  errorImageMessageColor = "#888",
  imageStyleConfig = {},
  fullscreenIconStyleConfig: {
    fullscreenIconName = "expand",
    fullscreenIconSize = 24,
    fullscreenIconColor = "white",
    fullscreenIconContainerStyle,
  } = {},
  alt,
}: PressableImageFullscreenProps) {
  const [pickedImage, setPickedImage] = React.useState<AppImageFile>();
  const { showImageFullscreen } = useImageFullScreenModal();

  React.useEffect(() => {
    if (image) setPickedImage(image);
  }, [image]);

  return (
    <Box style={[s.containerStyle, containerStyle]}>
      <Box style={[s.pickImageStyle, imageStyleConfig?.containerStyle]}>
        {pickedImage ? (
          <Image
            source={{
              uri: pickedImage.url || pickedImage.uri, // use backend URL directly
            }}
            style={[s.imageStyle, imageStyleConfig?.imageStyleProps]}
            resizeMode={imageStyleConfig?.resizeMode ?? "contain"}
            alt={alt ?? "Image"}
          />
        ) : (
          <Text
            style={[{ alignSelf: "center", color: errorImageMessageColor }]}
          >
            Cant Load Image
          </Text>
        )}
      </Box>

      {pickedImage && !removeFullScreenButton && (
        <Pressable
          onPress={() => pickedImage && showImageFullscreen(pickedImage.url!)}
          style={[s.fullscreenButton, fullscreenIconContainerStyle]}
        >
          <Ionicons
            name={fullscreenIconName}
            color={fullscreenIconColor}
            size={fullscreenIconSize}
          />
        </Pressable>
      )}
    </Box>
  );
}

const s = StyleSheet.create({
  containerStyle: {},
  removeImageStyle: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 6,
  },
  addImageStyle: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  pickImageStyle: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imageStyle: { width: "100%", height: "100%" },
  fullscreenButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
});
