import RNFetchBlob from "react-native-blob-util";
import api from "@/application/config/api";
import { CreateBoardingHouseInput } from "../boarding-houses/boarding-house.schema";
import { CreateRoom } from "../room/rooms.schema";

import { AppDocumentFile } from "@/infrastructure/document/document.schema";
import { AppImageFile } from "@/infrastructure/image/image.schema";
import { UploadFile } from "./upload.schemas";

type UploadResponse =
  | { success: true; data: any }
  | { success: false; error: string };

export const uploadBoardingHouse = async (
  data: CreateBoardingHouseInput,
): Promise<UploadResponse> => {
  const API_URL = api.BASE_URL;
  try {
    const formData: any[] = [
      { name: "ownerId", data: String(data.ownerId) },
      { name: "name", data: data.name },
      { name: "address", data: data.address },
      { name: "description", data: data.description || "" },
      { name: "occupancyType", data: data.occupancyType || "" },
      {
        name: "availabilityStatus",
        data: data.availabilityStatus ? "true" : "false",
      },
      { name: "amenities", data: JSON.stringify(data.amenities ?? []) },
      { name: "location", data: JSON.stringify(data.location ?? {}) },
      { name: "rooms", data: JSON.stringify(data.rooms ?? []) },
    ];

    // --- Thumbnail ---
    if (data.thumbnail?.[0]) {
      const file = data.thumbnail[0];
      formData.push({
        name: "thumbnail",
        filename: file.name ?? "thumbnail.jpg",
        type: file.type ?? "image/jpeg",
        data: RNFetchBlob.wrap(file.uri.replace("file://", "")),
      });
    }

    // --- Boarding house gallery ---
    data.gallery?.forEach((file, i) => {
      formData.push({
        name: "gallery",
        filename: file.name ?? `gallery-${i}.jpg`,
        type: file.type ?? "image/jpeg",
        data: RNFetchBlob.wrap(file.uri.replace("file://", "")),
      });
    });

    // --- Per-room gallery & thumbnail uploads ---
    data.rooms?.forEach((room, index) => {
      // 1️⃣ Room gallery
      room.gallery?.forEach((file, j) => {
        if (file?.uri) {
          const cleanUri = file.uri.startsWith("file://")
            ? file.uri
            : `file://${file.uri}`;

          formData.push({
            name: `roomGallery${index}_${j}`,
            filename: file.name ?? `room-${index}-${j}.jpg`,
            type: file.type ?? "image/jpeg",
            data: RNFetchBlob.wrap(cleanUri.replace("file://", "")),
          });
        }
      });

      // 2️⃣ Room thumbnail (if exists)
      if (room.thumbnail?.[0]?.uri) {
        const thumbFile = room.thumbnail[0];
        const cleanThumbUri = thumbFile.uri.startsWith("file://")
          ? thumbFile.uri
          : `file://${thumbFile.uri}`;

        formData.push({
          name: `roomThumbnail${index}_0`, // match backend naming
          filename: thumbFile.name ?? `roomThumbnail-${index}.jpg`,
          type: thumbFile.type ?? "image/jpeg",
          data: RNFetchBlob.wrap(cleanThumbUri.replace("file://", "")),
        });
      }
    });

    formData.forEach((part, i) => {
      if (typeof part.data === "string") {
        console.log(
          `  [${i}] ${part.name}: (string) ${part.data.slice(0, 80)}...`,
        );
      } else {
        console.log(`  [${i}] ${part.name}: (binary) ${part.filename}`);
      }
    });

    // --- Upload call ---
    const response = await RNFetchBlob.fetch(
      "POST",
      `${API_URL}/api/boarding-houses`,
      { "Content-Type": "multipart/form-data" },
      formData,
    );

    const json = response.json();
    if (json.success) {
      return { success: true, data: json.results };
    } else {
      return { success: false, error: json.results };
    }
  } catch (err: any) {
    console.error("Upload failed:", err);
    return { success: false, error: err.message ?? "Network error" };
  }
};

export const uploadRoom = async (
  boardingHouseId: number | string,
  rooms: Partial<CreateRoom>[],
): Promise<UploadResponse> => {
  try {
    const API_URL = api.BASE_URL;

    const formData: any[] = [
      {
        name: "rooms",
        data: JSON.stringify(
          rooms.map(({ gallery, thumbnail, ...rest }) => rest),
        ),
      },
    ];

    rooms.forEach((room, index) => {
      // Room gallery
      room.gallery?.forEach((file, j) => {
        if (!file?.uri) return;
        const cleanUri = file.uri.startsWith("file://")
          ? file.uri
          : `file://${file.uri}`;
        formData.push({
          name: `roomGallery${index}_${j}`,
          filename: file.name ?? `room-${index}-${j}.jpg`,
          type: file.type ?? "image/jpeg",
          data: RNFetchBlob.wrap(cleanUri.replace("file://", "")),
        });
      });

      // Room thumbnail
      if (room.thumbnail?.[0]?.uri) {
        const thumbFile = room.thumbnail[0];
        const cleanThumbUri = thumbFile.uri.startsWith("file://")
          ? thumbFile.uri
          : `file://${thumbFile.uri}`;
        formData.push({
          name: `roomThumbnail${index}_0`,
          filename: thumbFile.name ?? `roomThumbnail-${index}.jpg`,
          type: thumbFile.type ?? "image/jpeg",
          data: RNFetchBlob.wrap(cleanThumbUri.replace("file://", "")),
        });
      }
    });

    const response = await RNFetchBlob.fetch(
      "POST",
      `${API_URL}/api/boarding-houses/${boardingHouseId}/rooms`,
      { "Content-Type": "multipart/form-data" },
      formData,
    );

    const json = response.json();
    return json.success
      ? { success: true, data: json.results }
      : { success: false, error: json.results };
  } catch (err: any) {
    console.error("Room upload failed:", err);
    return { success: false, error: err.message ?? "Network error" };
  }
};

export function toUploadFile(file: AppDocumentFile | AppImageFile): UploadFile {
  return {
    uri: file.uri ?? file.url!,
    name: file.name,
    type: file.type,
  };
}
