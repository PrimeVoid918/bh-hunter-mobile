import { z } from "zod";
import {
  CreateRoomInputSchema,
  CreateRoomSchema,
  GetRoomSchema,
  UnifiedRoomCreateSchema,
} from "../room/rooms.schema";
import { AMENITIES } from "./boarding-house.constants";
import {
  BaseLocationSchema,
  GetLocationSchema,
} from "../location/location.schema";
import {
  BoardingHouseImageSchema,
  ImageUploadSchema,
} from "../image/image.schema";
import { GetBookingSchema } from "../booking/booking.schema";
import { PDFSchema } from "../valid-docs/pdf/pdf.schema";
import { SelectOption } from "@/components/ui/BottomSheet/BottomSheetSelector";

/* -----------------------------------------
   ENUMS & BASE SCHEMAS
------------------------------------------ */

export enum OccupancyType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  MIXED = "MIXED",
}

export const OccupancyTypeLabels: Record<OccupancyType, string> = {
  [OccupancyType.MALE]: "♂️ Male Only",
  [OccupancyType.FEMALE]: "♀️ Female Only",
  [OccupancyType.MIXED]: "⚧️ Mixed",
};

export type BackendOccupancyType = "MALE" | "FEMALE" | "MIXED";
export const BackendToFrontendMap: Record<BackendOccupancyType, OccupancyType> =
  {
    MALE: OccupancyType.MALE,
    FEMALE: OccupancyType.FEMALE,
    MIXED: OccupancyType.MIXED,
  };

export const OccupancyTypeEnumSchema = z.enum(["MALE", "FEMALE", "MIXED"]);

export const occupancyTypeOptions: SelectOption<BackendOccupancyType>[] = (
  Object.keys(OccupancyTypeLabels) as OccupancyType[]
).map((key) => ({
  value: key as BackendOccupancyType,
  label: OccupancyTypeLabels[key],
}));

/* -----------------------------------------
   ENUMS & BASE SCHEMAS
------------------------------------------ */

export const BaseBoardingHouseSchema = z.object({
  id: z.number(),
  ownerId: z.number(),
  name: z.string(),
  address: z.string(),
  description: z.string(),
  price: z.number(),
  amenities: z.array(z.string()),
  occupancyType: OccupancyTypeEnumSchema,
  availabilityStatus: z.boolean(),
  locationId: z.number(),

  location: GetLocationSchema,

  properties: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),

  bookings: z.array(GetBookingSchema), // or CreateBookingSchema if needed
  boardingHouseImage: z.array(BoardingHouseImageSchema),
  permits: z.array(PDFSchema),
  thumbnail: z.array(ImageUploadSchema).optional(),
  gallery: z.array(ImageUploadSchema).optional(),
});

export type BoardingHouse = z.infer<typeof BaseBoardingHouseSchema>;

export const GetBoardingHouseSchema = z.object({
  id: z.number(),
  ownerId: z.number(),
  name: z.string(),
  address: z.string(),
  description: z.string().optional(),
  amenities: z.array(z.enum(AMENITIES)),
  occupancyType: OccupancyTypeEnumSchema,
  availabilityStatus: z.boolean(),
  locationId: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable(),
  thumbnail: z.array(ImageUploadSchema).optional(),
  gallery: z.array(ImageUploadSchema).optional(),
  location: GetLocationSchema,
  rooms: z.array(GetRoomSchema).optional(),
  capacity: z.object({
    totalCapacity: z.number(),
    currentCapacity: z.number(),
  }),
  priceRange: z
    .object({
      highestPrice: z.number(),
      lowestPrice: z.number(),
    })
    .optional(),
});
export type GetBoardingHouse = z.infer<typeof GetBoardingHouseSchema>;

export const QueryBoardingHouseSchema = z.object({
  id: z.number().optional(),
  ownerId: z.number().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  availabilityStatus: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isDeleted: z.boolean().optional(),
  deletedAt: z.string().optional(),
  occupancyType: OccupancyTypeEnumSchema.optional(),
  location: GetLocationSchema.optional(),
  thumbnail: z.array(ImageUploadSchema).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sortBy: z.string().optional(),
  page: z.number().optional(),
  offset: z.number().optional(),
  capacity: z
    .object({
      totalCapacity: z.number(),
      currentCapacity: z.number(),
    })
    .optional(),
  priceRange: z
    .object({
      highestPrice: z.number(),
      lowestPrice: z.number(),
    })
    .optional(),
});
export type QueryBoardingHouse = z.infer<typeof QueryBoardingHouseSchema>;

export const FindOneBoardingHouseSchema = z.object({
  id: z.number(),
  ownerId: z.number(),
  name: z.string(),
  address: z.string(),
  description: z.string().optional(),
  amenities: z.array(z.enum(AMENITIES)),
  occupancyType: OccupancyTypeEnumSchema,
  availabilityStatus: z.boolean(),
  locationId: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable(),
  location: GetLocationSchema,
  thumbnail: z.array(ImageUploadSchema).optional(),
  gallery: z.array(ImageUploadSchema).optional(),
  rooms: z.array(GetRoomSchema).optional(),
  capacity: z.object({
    totalCapacity: z.number(),
    currentCapacity: z.number(),
  }),
});
export type FindOneBoardingHouse = z.infer<typeof FindOneBoardingHouseSchema>;

// Input schema for boarding house
export const CreateBoardingHouseInputSchema = z.object({
  ownerId: z
    .number()
    .positive({ message: "Owner ID must be a positive number" }),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  amenities: z.array(z.enum(AMENITIES)),
  occupancyType: OccupancyTypeEnumSchema,
  availabilityStatus: z.boolean(),
  thumbnail: z.array(ImageUploadSchema).optional(),
  gallery: z.array(ImageUploadSchema).optional(),
  location: BaseLocationSchema,
  rooms: z.array(CreateRoomInputSchema).optional(),
  // rooms: z.array(UnifiedRoomCreateSchema).optional(),
});

// Output schema with transformation  s
export const CreateBoardingHouseSchema =
  CreateBoardingHouseInputSchema.transform((data) => ({
    ...data,
    rooms: data.rooms
      ? data.rooms.map(
          (room) => CreateRoomInputSchema.parse(room), // Transform each room to output type
        )
      : undefined,
  }));

export type CreateBoardingHouseInput = z.infer<
  typeof CreateBoardingHouseInputSchema
>;
export type CreateBoardingHouse = z.infer<typeof CreateBoardingHouseSchema>;

export const PatchBoardingHouseSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    address: z.string().min(1, "Address cannot be empty").optional(),
    description: z.string().optional(),

    // Strict enum array
    amenities: z.array(z.enum(AMENITIES)).optional(),
    occupancyType: OccupancyTypeEnumSchema.optional(),

    availabilityStatus: z.boolean().optional(),

    // Optional location update (coordinates only),
    // but you mentioned this is coming from another module.
    // Keeping this optional if you add it later.
    location: z
      .object({
        coordinates: z.tuple([z.number(), z.number()]).optional(),
      })
      .optional(),
  })
  .strict(); // ⛔ blocks unwanted fields for safety

export type PatchBoardingHouseInput = z.infer<typeof PatchBoardingHouseSchema>;

/**
name
address
description
ameneties []
availability
location [x,y] => has its own module

thumbnail x
gallery x
 */
