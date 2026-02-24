import { z } from "zod";
import { GetTenantSchema } from "../tenants/tenant.types";
import { ImageUploadSchema } from "../image/image.schema";
import { GetRoomSchema } from "../room/rooms.schema";

// BookingType enum
export const BookingTypeEnum = z.enum([
  "RESERVATION",
  "SOLO",
  "DUO",
  "TRIO",
  "SQUAD",
  "FAMILY",
]);

// BookingStatus enum
export const BookingStatusEnum = z.enum([
  "PENDING_REQUEST", //🟡 Tenant requested booking
  "AWAITING_PAYMENT", //🟠 Owner approved, waiting for tenant to upload proof
  "PAYMENT_APPROVAL", //🟠
  "CANCELLED_BOOKING", //🔴
  "REJECTED_BOOKING", //🔴
  "COMPLETED_BOOKING", //🟢
  "PAYMENT_FAILED",
]);

type BookingStatus = z.infer<typeof BookingStatusEnum>;

interface StatusMetadata {
  label: string;
  color: string;
  description: string;
}

const statusMap: Record<BookingStatus, StatusMetadata> = {
  PENDING_REQUEST: {
    label: "Pending Request",
    color: "#EAB308", // Yellow
    description: "Waiting for the owner to accept your request.",
  },
  AWAITING_PAYMENT: {
    label: "Awaiting Payment",
    color: "#3B82F6", // Blue (Changed to blue to indicate "Action Required")
    description: "Request approved! Pay now to secure your spot.",
  },
  PAYMENT_APPROVAL: {
    label: "Verifying Payment",
    color: "#F97316", // Orange
    description: "We're confirming your payment. This won't take long!",
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    color: "#B91C1C", // Dark Red
    description:
      "Something went wrong. Please try again or use another method.",
  },
  CANCELLED_BOOKING: {
    label: "Cancelled",
    color: "#6B7280", // Gray (Neutral color for inactive/closed states)
    description: "This booking has been cancelled.",
  },
  REJECTED_BOOKING: {
    label: "Declined",
    color: "#EF4444", // Light Red
    description: "The owner declined this request.",
  },
  COMPLETED_BOOKING: {
    label: "Confirmed",
    color: "#22C55E", // Green
    description: "You're all set! The room is secured.",
  },
};

/**
 * Helper to get human-readable status metadata
 */
export const getBookingStatusDetails = (
  status: string | BookingStatus,
): StatusMetadata => {
  return (
    statusMap[status as BookingStatus] ?? {
      label: "Unknown",
      color: "#94A3B8",
      description: "Status unknown",
    }
  );
};

export const bookingSchema = z.object({
  id: z.number(),
  reference: z.string(),
  tenantId: z.number(),
  roomId: z.number(),
  room: GetRoomSchema.pick({
    roomNumber: true,
    availabilityStatus: true,
    price: true,
    thumbnail: true,
  }),
  bookingType: BookingTypeEnum,
  dateBooked: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  checkInDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  checkOutDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  status: BookingStatusEnum,
  paymentProofId: z.string().optional(),
  totalAmount: z.string().optional(), // decimal represented as string in frontend
  currency: z.string().optional(),
  ownerMessage: z.string().optional(),
  tenantMessage: z.string().optional(),
  expiresAt: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date",
    })
    .optional(),
  createdAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  updatedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  isDeleted: z.boolean(),
  deletedAt: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date",
    })
    .optional(),
});

// Base schema for a Booking entity
export const BaseBookingSchema = bookingSchema; // reuse the schema you already have

// For query / find one endpoints
// Booking fetch schema
export const GetBookingSchema = BaseBookingSchema.pick({
  id: true,
  reference: true,
  tenantId: true,
  roomId: true,
  room: true,
  bookingType: true,
  checkInDate: true,
  checkOutDate: true,
  status: true,
  paymentStatus: true,
  totalAmount: true,
  currency: true,
  createdAt: true,
  updatedAt: true,
  ownerMessage: true,
  tenantMessage: true,
  paymentProofId: true,
}).extend({
  tenant: GetTenantSchema.optional(), // full tenant info
  boardingHouse: z
    .object({
      id: z.number(),
      name: z.string(),
      ownerId: z.number(),
      address: z.string(),
      thumbnail: z.array(
        z.object({
          id: z.number(),
          url: z.string(),
          fileFormat: z.string(),
          type: z.string(),
          quality: z.string(),
          createdAt: z.string(),
          isDeleted: z.boolean(),
          deletedAt: z.string().nullable(),
          entityType: z.string(),
          entityId: z.number(),
        }),
      ),
    })
    .optional(), // optional boarding house at top-level
  room: z.object({
    id: z.number(),
    roomNumber: z.string(),
    availabilityStatus: z.boolean(),
    price: z.union([z.string(), z.number()]), // price can be string or number
    thumbnail: z.array(
      z.object({
        id: z.number(),
        url: z.string(),
        fileFormat: z.string(),
        type: z.string(),
        quality: z.string(),
        createdAt: z.string(),
        isDeleted: z.boolean(),
        deletedAt: z.string().nullable(),
        entityType: z.string(),
        entityId: z.number(),
      }),
    ),
    boardingHouse: z.object({
      id: z.number(),
      name: z.string(),
      ownerId: z.number(),
    }),
  }),
});
export type GetBooking = z.infer<typeof GetBookingSchema>;

//Query filteres
export const QueryBookingSchema = z.object({
  bookId: z.number().optional(),
  tenantId: z.number().optional(),
  ownerId: z.number().optional(),
  roomId: z.number().optional(),
  boardingHouseId: z.number().optional(),
  status: BookingStatusEnum.optional(),
  bookingType: BookingTypeEnum.optional(),
  fromCheckIn: z.string().optional(), // ISO string
  toCheckIn: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10), // rename offset → limit to match backend
});

export type QueryBooking = z.infer<typeof QueryBookingSchema>;

//* Create Booking DTO
export const createBookingSchema = z.object({
  tenantId: z.number(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  note: z.string().optional(),
});
export const CreateBookingInputSchema = createBookingSchema;
export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>;

//* Patch Tenant Booking DTO
export const patchTenantBookingSchema = z.object({
  tenantId: z.number(),
  newStartDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date",
    })
    .optional(),
  newEndDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date",
    })
    .optional(),
  cancelReason: z.string().optional(),
});
export const PatchTenantBookingInputSchema = patchTenantBookingSchema;
export type PatchTenantBookingInput = z.infer<
  typeof PatchTenantBookingInputSchema
>;

//* Approve Booking
export const patchApproveBookingSchema = z.object({
  ownerId: z.number(),
  message: z.string().optional(),
});
export const PatchApproveBookingInputSchema = patchApproveBookingSchema;
export type PatchApproveBookingInput = z.infer<
  typeof PatchApproveBookingInputSchema
>;

//* Reject Booking
export const patchRejectBookingSchema = z.object({
  ownerId: z.number(),
  reason: z.string(),
});
export const PatchRejectBookingInputSchema = patchRejectBookingSchema;
export type PatchRejectBookingInput = z.infer<
  typeof PatchRejectBookingInputSchema
>;

//* Create Payment Proof
export const createPaymentProofSchema = z.object({
  tenantId: z.number(),
  note: z.string().optional(),
  paymentImage: ImageUploadSchema,
});
export const CreatePaymentProofInputSchema = createPaymentProofSchema;
export type CreatePaymentProofInput = z.infer<
  typeof CreatePaymentProofInputSchema
>;

//* Verify Payment
export const patchVerifyPaymentSchema = z.object({
  ownerId: z.number(),
  remarks: z.string().optional(),
  newStatus: BookingStatusEnum.optional(),
});
export const PatchVerifyPaymentInputSchema = patchVerifyPaymentSchema;
export type PatchVerifyPaymentInput = z.infer<
  typeof PatchVerifyPaymentInputSchema
>;

//* Cancel Booking
export const cancelBookingSchema = z.object({
  userId: z.number(),
  role: z.enum(["TENANT", "OWNER"]),
  reason: z.string().optional(),
});
export const CancelBookingInputSchema = cancelBookingSchema;
export type CancelBookingInput = z.infer<typeof CancelBookingInputSchema>;
