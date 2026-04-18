import {
  launchImageLibrary,
  ImageLibraryOptions,
} from "react-native-image-picker";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { AppImageFile, ImageUploadSchema } from "./image.schema";
import { moveToPersistentDir } from "../utils/expo-utils/expo-utils.service";

export const PERSISTENT_IMAGE_DIR = `${FileSystem.documentDirectory}picked_images/`;

/**
 * Ensures a file URI is readable for RNFetchBlob / file access.
 * If the file is not directly readable, copies it to the cache directory.
 *
 * @param {AppImageFile} image - The image object to make readable
 * @returns {Promise<string>} - A URI that can safely be used for file operations
 */
async function makeBlobReadable(image: AppImageFile): Promise<string> {
  try {
    const info = await FileSystem.getInfoAsync(image.uri);
    if (info.exists) {
      // Expo sometimes prefixes file:// twice — normalize
      return info.uri.replace("file://", "");
    }

    // Copy to cache dir if not directly readable
    const newPath = `${FileSystem.cacheDirectory}${image.name}`;
    await FileSystem.copyAsync({ from: image.uri, to: newPath });
    return newPath.replace("file://", "");
  } catch (err) {
    console.warn("makeBlobReadable error:", err);
    return image.uri.replace("file://", "");
  }
}

//* Public functions
/* Public functions */
/**
 * Pick one or multiple images using react-native-image-picker.
 * Validates image metadata and schema before returning.
 *
 * @param {number} [limit=1] - Maximum number of images to select
 * @returns {Promise<AppImageFile[] | null>} - Array of image objects or null if cancelled
 * @throws {Error} If image selection fails or images are invalid
 *
 * @deprecated Use {@link pickImageExpo} instead.
 *             We plan to remove this function in a future major release.
 */
export async function pickImage(
  limit: number = 1,
): Promise<AppImageFile[] | null> {
  const defaultOptions: ImageLibraryOptions = {
    mediaType: "photo",
    selectionLimit: limit,
  };

  return new Promise((resolve, reject) => {
    launchImageLibrary(defaultOptions, async (response) => {
      if (response.didCancel) {
        return resolve(null);
      }

      const rawAssets = response.assets ?? [];
      if (rawAssets.length === 0) {
        return reject(new Error("No image selected"));
      }

      const images: AppImageFile[] = [];

      for (const asset of rawAssets) {
        if (!asset.uri || !asset.type || !asset.fileName) {
          return reject(new Error("Invalid image metadata"));
        }

        const image: AppImageFile = {
          uri: asset.uri,
          url: asset.uri,
          type: asset.type,
          name: asset.fileName,
          size: asset.fileSize,
          quality: "medium",
        };

        const parse = ImageUploadSchema.safeParse(image);
        if (!parse.success) {
          return reject(new Error("Invalid image file"));
        }

        const safeUri = await makeBlobReadable(image);
        images.push({ ...image, uri: safeUri });
      }

      if (images.length > limit) {
        return reject(
          new Error(`Uploaded images exceed the limit of ${limit}`),
        );
      }

      resolve(images);
    });
  });
}

/**
 * Request permission to access the media library.
 *
 *
 * @returns {Promise<boolean>} - True if permission granted, false otherwise
 */
export async function requestImagePermission(): Promise<boolean> {
  if (Platform.OS !== "web") {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permissionResult.granted;
  }
  return true;
}

/**
 * Pick images using Expo's ImagePicker.
 * Validates schema and ensures files are readable.
 *
 * @param {number} [limit=1] - Maximum number of images to select
 * @param {string} [imgQuality="medium"] - Quality setting for the image
 * @returns {Promise<AppImageFile[] | null>} - Array of validated images or null if cancelled
 * @throws {Error} If permission denied, invalid image, or exceeds limit
 */
export async function pickImageExpo(
  limit: number = 1,
  imgQuality: string = "medium",
): Promise<AppImageFile[] | null> {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    throw new Error("Permission to access media library was denied");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 1,
  });

  if (result.canceled) return null;

  const images: AppImageFile[] = [];

  for (const asset of result.assets) {
    const image: AppImageFile = {
      uri: asset.uri,
      url: asset.uri,
      type: asset.mimeType || "image/jpeg",
      name: asset.fileName || `image-${Date.now()}.jpg`,
      quality: imgQuality,
      size: asset.fileSize || 0,
    };

    const parse = ImageUploadSchema.safeParse(image);
    if (!parse.success) {
      console.log("Zod parsing error:", parse.error.format());
      throw new Error("Invalid image file");
    }

    const persistentUri = await moveToPersistentDir({
      file: image,
      dir: "images",
    });
    images.push({ ...image, uri: persistentUri });
    //! possible breakeage
    // image.uri = image.uri.replace("file://", "");
    // image.url = image?.url!.replace("file://", "");
  }

  if (images.length > limit) {
    throw new Error(`Uploaded images exceed the limit of ${limit}`);
  }

  return images;
}
