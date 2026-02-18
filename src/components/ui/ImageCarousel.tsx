import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";
import React, { useState } from "react";
import {
  AppImageFile,
  BackendImage,
} from "../../infrastructure/image/image.schema";
import {
  BorderRadius,
  BorderWidth,
  Colors,
  ShadowLight,
  Spacing,
} from "@/constants";
import PressableImageFullscreen from "./ImageComponentUtilities/PressableImageFullscreen";
import { he } from "zod/v4/locales";

interface CarouselProps {
  images: Array<AppImageFile | undefined>;
  variant?: "primary" | "secondary" | "fullBleed";
  containerStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
}

export default function ImageCarousel({
  images,
  variant = "primary",
  scrollStyle,
  containerStyle,
}: CarouselProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [mainImage, setMainImage] = useState(0);
  // make 404 images report to not found in images

  const setSelectedIndex = (i: number) => {
    setImageIndex(i);
    setMainImage(i);
  };

  const variantStyle: Record<string, any> = {
    primary: {
      container: {
        borderWidth: BorderWidth.lg,
        borderRadius: BorderRadius.xl,
        overflow: "hidden",
        ...ShadowLight.xl,
      },
      mainImage: {
        height: 296,
        aspectRatio: 16 / 9,
        alignSelf: "center",
      },
      carousel: {
        padding: Spacing.md,
        gap: Spacing.base,
      },
      carousel_orientation: "row",
      carousel_item_definition: {
        borderRadius: BorderRadius.md,
      },
      thumbnailSize: 80,
    },
    secondary: {
      container: {
        height: 250,
        borderWidth: BorderWidth.lg,
        borderRadius: BorderRadius.xl,
        flexDirection: "row",
        overflow: "hidden",
        ...ShadowLight.xl,
      },
      mainImage: {
        flexGrow: 1000000000,
      },
      carousel: {
        padding: Spacing.md,
        gap: Spacing.base,
      },
      carousel_orientation: "column",
      carousel_item_definition: {
        borderRadius: BorderRadius.md,
      },
      thumbnailSize: 80,
    },
  };

  return (
    <View style={[variantStyle[variant].container, containerStyle]}>
      {!images[mainImage] ? (
        <View
          style={[
            variantStyle[variant].mainImage,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text>Image not found</Text>
        </View>
      ) : (
        <PressableImageFullscreen
          image={images[mainImage]}
          containerStyle={[variantStyle[variant].mainImage]} // parent flex
          imageStyleConfig={{
            // containerStyle: ,
            resizeMode: "cover",
            // imageStyleProps: ,
          }}
        />
      )}
      <ScrollView
        showsHorizontalScrollIndicator={
          variantStyle[variant].carousel_orientation === "row" ? true : false
        }
        showsVerticalScrollIndicator={
          variantStyle[variant].carousel_orientation === "row" ? false : true
        }
        contentContainerStyle={[variantStyle[variant].carousel, scrollStyle]}
        nestedScrollEnabled
      >
        <ScrollView
          showsHorizontalScrollIndicator={
            variantStyle[variant].carousel_orientation === "row" ? true : false
          }
          showsVerticalScrollIndicator={
            variantStyle[variant].carousel_orientation === "row" ? false : true
          }
          contentContainerStyle={{
            flexDirection: variantStyle[variant].carousel_orientation,
            gap: 10,
          }}
        >
          {images ? (
            images.map((image, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedIndex(i)}>
                {!image ? (
                  <Text
                    style={[{ justifyContent: "center", alignItems: "center" }]}
                  >
                    Image not found
                  </Text>
                ) : (
                  <Image
                    source={
                      typeof images[i]?.url === "string"
                        ? { uri: images[i].url }
                        : images[i]?.url
                    }
                    style={{
                      width: variantStyle[variant].thumbnailSize,
                      height: variantStyle[variant].thumbnailSize,
                      borderRadius:
                        variantStyle[variant].carousel_item_definition
                          .borderRadius,
                      borderWidth: BorderWidth.md,
                      borderColor:
                        i === imageIndex
                          ? variantStyle[variant].carousel_item_definition
                              .borderColorSelected
                          : variantStyle[variant].carousel_item_definition
                              .borderColorNotSelected,
                      ...(i === imageIndex ? ShadowLight.xxl : {}),
                    }}
                  />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text>Images not found</Text>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
}
