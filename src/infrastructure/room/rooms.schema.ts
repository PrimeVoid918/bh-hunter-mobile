import { z } from "zod";
import {
  ImageUploadSchema,
  ImageResponseSchema,
  AppImageFile,
} from "../image/image.schema";
import { ROOM_FEATURE_TAGS } from "./rooms.constants";
import { SelectOption } from "@/components/ui/BottomSheet/BottomSheetSelector";

/* -----------------------------------------
   ENUMS & BASE SCHEMAS
------------------------------------------ */

// Frontend enum
export enum RoomType {
  STUDIO = "STUDIO",
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  BED_SPACER = "BED_SPACER",
  APARTMENT = "APARTMENT",
}

// Labels used in frontend UI
export const RoomTypeLabels: Record<RoomType, string> = {
  [RoomType.STUDIO]: "Studio Room",
  [RoomType.SINGLE]: "Single Room (Private Room)",
  [RoomType.DOUBLE]: "Double Room",
  [RoomType.BED_SPACER]: "Bed Spacer / Shared Room",
  [RoomType.APARTMENT]: "Apartment / Shared Room",
};

// Backend string union
export type BackendRoomType =
  | "STUDIO"
  | "SINGLE"
  | "DOUBLE"
  | "BED_SPACER"
  | "APARTMENT";

// Backend → Frontend enum mapper
export const BackendRoomTypeToFrontend: Record<BackendRoomType, RoomType> = {
  STUDIO: RoomType.STUDIO,
  SINGLE: RoomType.SINGLE,
  DOUBLE: RoomType.DOUBLE,
  BED_SPACER: RoomType.BED_SPACER,
  APARTMENT: RoomType.APARTMENT,
};

// Zod schema for backend values
export const RoomTypeEnumSchema = z.enum([
  "STUDIO",
  "SINGLE",
  "DOUBLE",
  "BED_SPACER",
  "APARTMENT",
]);

export const roomTypeOptions: SelectOption<BackendRoomType>[] = (
  Object.keys(RoomTypeLabels) as RoomType[]
).map((key) => ({
  value: key as BackendRoomType,
  label: RoomTypeLabels[key],
}));

/* -----------------------------------------
   ROOM FURNISHING TYPE
------------------------------------------ */

// Frontend enum
export enum RoomFurnishingType {
  UNFURNISHED = "UNFURNISHED",
  SEMI_FURNISHED = "SEMI_FURNISHED",
  FULLY_FURNISHED = "FULLY_FURNISHED",
}

// Labels used in UI
export const RoomFurnishingLabels: Record<RoomFurnishingType, string> = {
  [RoomFurnishingType.UNFURNISHED]: "Unfurnished",
  [RoomFurnishingType.SEMI_FURNISHED]: "Semi-Furnished",
  [RoomFurnishingType.FULLY_FURNISHED]: "Fully Furnished",
};

// Backend union
export type BackendRoomFurnishingType =
  | "UNFURNISHED"
  | "SEMI_FURNISHED"
  | "FULLY_FURNISHED";

// Backend → Frontend enum mapper
export const BackendFurnishingToFrontend: Record<
  BackendRoomFurnishingType,
  RoomFurnishingType
> = {
  UNFURNISHED: RoomFurnishingType.UNFURNISHED,
  SEMI_FURNISHED: RoomFurnishingType.SEMI_FURNISHED,
  FULLY_FURNISHED: RoomFurnishingType.FULLY_FURNISHED,
};

// Zod schema for backend values
export const RoomFurnishingEnumSchema = z.enum([
  "UNFURNISHED",
  "SEMI_FURNISHED",
  "FULLY_FURNISHED",
]);

export const roomFurnishingTypeOptions: SelectOption<BackendRoomFurnishingType>[] =
  (Object.keys(RoomFurnishingLabels) as RoomFurnishingType[]).map((key) => ({
    value: key as BackendRoomFurnishingType,
    label: RoomFurnishingLabels[key],
  }));
/* -----------------------------------------
   READ / FETCH SCHEMAS
------------------------------------------ */

export const GetRoomSchema = z.object({
  id: z.number(),
  boardingHouseId: z.number(),
  roomNumber: z.string(),
  description: z.string(),
  maxCapacity: z.number(),
  currentCapacity: z.number(),
  price: z.preprocess((val) => Number(val), z.number()),
  gallery: z.array(ImageUploadSchema).optional(),
  thumbnail: z.array(ImageUploadSchema).optional(),
  tags: z.array(z.enum(ROOM_FEATURE_TAGS)).optional(),
  roomType: RoomTypeEnumSchema.optional(),
  furnishingType: RoomFurnishingEnumSchema.optional(),
  availabilityStatus: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable(),
});

export type GetRoom = z.infer<typeof GetRoomSchema>;

export const FindOneRoomSchema = GetRoomSchema; // ✅ identical schema, no duplication
export type FindOneRoom = z.infer<typeof FindOneRoomSchema>;

/* -----------------------------------------
   CREATE (STANDALONE)
------------------------------------------ */

export const CreateRoomInputSchema = z.object({
  roomNumber: z.string(),
  description: z.string().optional(),
  maxCapacity: z.union([z.string(), z.number()]),
  price: z.union([z.string(), z.number()]),
  roomType: RoomTypeEnumSchema,
  furnishingType: RoomFurnishingEnumSchema.optional(),
  tags: z.array(z.string()).default([]),
  gallery: z
    .array(
      z.object({
        uri: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
      }),
    )
    .default([]),
  thumbnail: z
    .array(
      z.object({
        uri: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
      }),
    )
    .default([]),
});

export const CreateRoomSchema = CreateRoomInputSchema.transform((data) => ({
  ...data,
  maxCapacity: data.maxCapacity,
  price: data.price,
  tags: data.tags ?? [],
}));

export type CreateRoomInput = z.infer<typeof CreateRoomInputSchema>;
export type CreateRoom = z.input<typeof CreateRoomSchema>;

/* -----------------------------------------
   CREATE (UNIFIED WITH BOARDING HOUSE)
------------------------------------------ */

// Used when rooms are created inline during Boarding House creation
export const UnifiedRoomCreateSchema = z
  .object({
    roomNumber: z.string().min(1, "Room number is required"),
    maxCapacity: z.coerce
      .number()
      .min(1)
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
        message: "Max capacity must be a positive number",
      }),
    price: z.coerce
      .number()
      .min(1)
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
        message: "Price must be a valid number",
      }),
    gallery: z.array(ImageUploadSchema).optional(),
    tags: z.array(z.enum(ROOM_FEATURE_TAGS)).optional(),
    roomType: RoomTypeEnumSchema.optional(),
    furnishingType: RoomFurnishingEnumSchema.optional(),
  })
  .transform((data) => ({
    ...data,
    tags: data.tags ?? [],
    roomType: data.roomType ?? RoomType.STUDIO,
    furnishingType: data.furnishingType ?? RoomFurnishingType.UNFURNISHED,
  }));

export type UnifiedRoomCreate = z.output<typeof UnifiedRoomCreateSchema>;

/* -----------------------------------------
   UPDATE (PATCH) SCHEMA — For Redux RTK
------------------------------------------ */

export const PatchRoomInputSchema = z.object({
  roomNumber: z.string().optional(),
  description: z.string().optional(),
  maxCapacity: z.union([z.string(), z.number()]).optional(),
  price: z.union([z.string(), z.number()]).optional(),
  roomType: RoomTypeEnumSchema.optional(),
  furnishingType: RoomFurnishingEnumSchema.optional(),
  availabilityStatus: z.boolean().optional(),
  tags: z.array(z.enum(ROOM_FEATURE_TAGS)).optional(),

  // RN image objects for upload
  gallery: z
    .array(
      z.object({
        uri: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
      }),
    )
    .optional(),

  thumbnail: z
    .array(
      z.object({
        uri: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
      }),
    )
    .optional(),

  // Optional removal arrays
  removeGalleryIds: z.array(z.number()).optional(),
  removeThumbnailId: z.number().optional(),
});

export type PatchRoomInput = z.infer<typeof PatchRoomInputSchema>;
