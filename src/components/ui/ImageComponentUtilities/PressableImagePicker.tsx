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
import { Box } from "@gluestack-ui/themed";
import { AppImageFile } from "@/infrastructure/image/image.schema";
import { pickImageExpo } from "@/infrastructure/image/image.service";
import { Ionicons } from "@expo/vector-icons";
import { IoniconsIconType } from "@/constants/icons/IonIconsTypes";
import { useImageFullScreenModal } from "./GlobalImageFullScreenProvider";

/**
 * Props for `PressableImagePicker` component.
 */
interface PressableImagePickerProps {
  /** Pass image object */
  image?: AppImageFile;
  /** Callback when an image is picked */
  pickImage: (image: AppImageFile) => void;
  /** Callback when the selected image is removed */
  removeImage?: () => void;
  /** Message to show when no image is picked */
  pickImageMessage?: string;
  /** Color of the pick image message text */
  pickImageMessageColor?: ColorValue;
  /** Container style for the outer Box */
  containerStyle?: StyleProp<ViewStyle>;
  /** Styles and configuration for the image container */
  imageStyleConfig?: {
    imageStyleProps?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    resizeMode?: ImageResizeMode;
  };
  /** Configuration for the remove image icon button */
  removeImageIconStyleConfig?: {
    removeImageIconSize?: number;
    removeImageIconColor?: ColorValue;
    removeImageIconName?: IoniconsIconType;
    removeImageIconContainerStyle?: StyleProp<ViewStyle>;
  };
  /** Configuration for the add image icon button */
  addImageIconStyleConfig?: {
    addImageIconSize?: number;
    addImageIconColor?: ColorValue;
    addImageIconName?: IoniconsIconType;
    addImageIconContainerStyle?: StyleProp<ViewStyle>;
  };
  /** Configuration for the fullscreen image button */
  fullscreenIconStyleConfig?: {
    fullscreenIconSize?: number;
    fullscreenIconColor?: ColorValue;
    fullscreenIconName?: IoniconsIconType;
    fullscreenIconContainerStyle?: StyleProp<ViewStyle>;
  };
  /** Alternative text for the Image component */
  alt?: string;
}

/**
 * `PressableImagePicker` is a customizable React Native component
 * for selecting, displaying fullscreen images.
 *
 * Features:
 * - Pick image using Expo Image Picker
 * - Show image preview or a placeholder message
 * - Optional fullscreen preview using a global modal hook
 * - Configurable icon buttons for adding/removing images
 *
 * @param {PressableImagePickerProps} props
 */
export default function PressableImagePicker({
  image,
  pickImage,
  removeImage,
  pickImageMessage = "Add Image",
  pickImageMessageColor = "#888",
  containerStyle = {},
  imageStyleConfig = {},
  removeImageIconStyleConfig: {
    removeImageIconName = "close",
    removeImageIconSize = 24,
    removeImageIconColor = "white",
    removeImageIconContainerStyle,
  } = {},
  addImageIconStyleConfig: {
    addImageIconName = "add",
    addImageIconSize = 24,
    addImageIconColor = "white",
    addImageIconContainerStyle,
  } = {},
  fullscreenIconStyleConfig: {
    fullscreenIconName = "expand",
    fullscreenIconSize = 24,
    fullscreenIconColor = "white",
    fullscreenIconContainerStyle,
  } = {},
  alt,
}: PressableImagePickerProps) {
  /** The current selected image */
  const [pickedImage, setPickedImage] = React.useState<AppImageFile>();

  /** Derived boolean to simplify conditional rendering */
  const isImagePicked = Boolean(pickedImage);

  /** Global fullscreen modal hook */
  const { showImageFullscreen } = useImageFullScreenModal();

  /** Initialize picked image if provided via props */
  React.useEffect(() => {
    if (image) setPickedImage(image);
  }, [image]);

  /**
   * Handle picking an image from the device library.
   * Uses `pickImageExpo` helper and updates state/callback.
   */
  const handlePickThumbnailImage = async () => {
    if (!pickedImage) {
      try {
        const picked = await pickImageExpo(1);
        if (picked && picked.length > 0) {
          setPickedImage(picked[0]);
          pickImage(picked[0]);
        }
      } catch (err) {
        console.log("Pick error:", err);
        Alert.alert("Error", "Invalid image file");
      }
    }
  };

  /**
   * Remove the currently selected image.
   * Calls `removeImage` callback if provided.
   */
  const handleRemoveThumbnailImage = () => {
    setPickedImage(undefined);
    removeImage?.();
  };

  return (
    <Box style={[s.containerStyle, containerStyle]}>
      <Box style={[s.pickImageStyle, imageStyleConfig?.containerStyle]}>
        {pickedImage ? (
          <Image
            source={{
              uri: pickedImage.uri.startsWith("file://")
                ? pickedImage.uri
                : `file://${pickedImage.uri}`,
            }}
            style={[s.imageStyle, imageStyleConfig?.imageStyleProps]}
            resizeMode={imageStyleConfig?.resizeMode ?? "contain"}
            alt={alt ?? "Image"}
          />
        ) : (
          <Text style={{ color: pickImageMessageColor }}>
            {pickImageMessage}
          </Text>
        )}
      </Box>

      {isImagePicked && (
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

      {!isImagePicked && (
        <Pressable
          onPress={handlePickThumbnailImage}
          style={[s.addImageStyle, addImageIconContainerStyle]}
        >
          <Box>
            <Ionicons
              name={addImageIconName}
              color={addImageIconColor}
              size={addImageIconSize}
            />
          </Box>
        </Pressable>
      )}
      {isImagePicked && (
        <Pressable
          onPress={handleRemoveThumbnailImage}
          style={[s.removeImageStyle, removeImageIconContainerStyle]}
        >
          <Box>
            <Ionicons
              name={removeImageIconName}
              color={removeImageIconColor}
              size={removeImageIconSize}
            />
          </Box>
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
    borderRadius: 20,
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
    height: 200,
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
