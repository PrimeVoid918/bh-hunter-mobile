import { z } from "zod";
import { GetTenantSchema } from "../tenants/tenant.types";
import { ImageUploadSchema } from "../image/image.schema";
import { GetRoomSchema } from "../room/rooms.schema";

/*
|--------------------------------------------------------------------------
| ENUMS
|--------------------------------------------------------------------------
*/

export const BookingTypeEnum = z.enum([
  "RESERVATION",
  "SOLO",
  "DUO",
  "TRIO",
  "SQUAD",
  "FAMILY",
]);

export const BookingStatusEnum = z.enum([
  "PENDING_REQUEST",
  "AWAITING_PAYMENT",
  "PAYMENT_APPROVAL",
  "CANCELLED_BOOKING",
  "REJECTED_BOOKING",
  "COMPLETED_BOOKING",
  "PAYMENT_FAILED",
  "REFUNDED_PAYMENT",
]);

export const PaymentStatusEnum = z.enum([
  "PENDING",
  "REQUIRES_ACTION",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "EXPIRED",
]);

export const RefundStatusEnum = z.enum([
  "NONE",
  "ELIGIBLE",
  "PARTIAL",
  "FULL",
  "NOT_REFUNDABLE",
]);

export type BookingStatus = z.infer<typeof BookingStatusEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type RefundStatus = z.infer<typeof RefundStatusEnum>;

/*
|--------------------------------------------------------------------------
| REFUND PREVIEW
|--------------------------------------------------------------------------
*/

export const RefundPreviewSchema = z.object({
  refundStatus: RefundStatusEnum,
  refundable: z.boolean(),
  percentage: z.number(),
  refundAmount: z.string(),
  originalAmount: z.string(),
  currency: z.string(),

  // debug / optional fields
  checkInDate: z.string().optional(),
  now: z.string().optional(),
});

export type RefundPreview = z.infer<typeof RefundPreviewSchema>;

/*
|--------------------------------------------------------------------------
| BOOKING STATUS (for GET /bookings/:id/status)
|--------------------------------------------------------------------------
*/

export const BookingRefundInfoSchema = z.object({
  eligible: z.boolean(),
  percentage: z.number(),
  refundAmount: z.number(),
  totalAmount: z.number(),
  hoursBeforeCheckIn: z.number(),
});

export const BookingStatusSchema = z.object({
  bookingId: z.number(),
  bookingStatus: BookingStatusEnum,
  paymentStatus: PaymentStatusEnum.nullable(),
  refund: BookingRefundInfoSchema.nullable(),
});

export type BookingStatusResponse = z.infer<typeof BookingStatusSchema>;

/*
|--------------------------------------------------------------------------
| STATUS METADATA (UI Helper)
|--------------------------------------------------------------------------
*/

interface StatusMetadata {
  label: string;
  color: string;
  description: string;
}
const statusMap: Record<BookingStatus, StatusMetadata> = {
  PENDING_REQUEST: {
    label: "Pending Request",
    color: "#EAB308",
    description: "Waiting for the owner to accept your request.",
  },

  AWAITING_PAYMENT: {
    label: "Awaiting Payment",
    color: "#3B82F6",
    description: "Request approved! Pay now to secure your spot.",
  },

  PAYMENT_APPROVAL: {
    label: "Verifying Payment",
    color: "#F97316",
    description: "We're confirming your payment.",
  },

  PAYMENT_FAILED: {
    label: "Payment Failed",
    color: "#B91C1C",
    description: "Something went wrong. Please try again.",
  },

  CANCELLED_BOOKING: {
    label: "Cancelled",
    color: "#6B7280",
    description: "This booking has been cancelled.",
  },

  REJECTED_BOOKING: {
    label: "Declined",
    color: "#EF4444",
    description: "The owner declined this request.",
  },

  COMPLETED_BOOKING: {
    label: "Confirmed",
    color: "#22C55E",
    description: "You're all set! The room is secured.",
  },

  REFUNDED_PAYMENT: {
    label: "Refunded",
    color: "#6366F1",
    description: "Your payment has been refunded.",
  },
};

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

/*
|--------------------------------------------------------------------------
| BASE BOOKING ENTITY
|--------------------------------------------------------------------------
*/

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

  dateBooked: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),

  status: BookingStatusEnum,

  paymentStatus: PaymentStatusEnum.optional(),

  paymentProofId: z.string().optional(),

  totalAmount: z.string().optional(),
  currency: z.string().optional(),

  ownerMessage: z.string().optional(),
  tenantMessage: z.string().optional(),

  expiresAt: z.string().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),

  isDeleted: z.boolean(),
  deletedAt: z.string().nullable().optional(),
});

export const BaseBookingSchema = bookingSchema;

/*
|--------------------------------------------------------------------------
| GET BOOKING RESPONSE
|--------------------------------------------------------------------------
*/

export const GetBookingSchema = BaseBookingSchema.extend({
  tenant: GetTenantSchema.optional(),

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
    .optional(),

  room: z.object({
    id: z.number(),
    roomNumber: z.string(),
    availabilityStatus: z.boolean(),
    price: z.union([z.string(), z.number()]),

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

/*
|--------------------------------------------------------------------------
| QUERY FILTERS
|--------------------------------------------------------------------------
*/

export const QueryBookingSchema = z.object({
  bookId: z.number().optional(),
  tenantId: z.number().optional(),
  ownerId: z.number().optional(),
  roomId: z.number().optional(),
  boardingHouseId: z.number().optional(),

  status: BookingStatusEnum.optional(),
  bookingType: BookingTypeEnum.optional(),

  fromCheckIn: z.string().optional(),
  toCheckIn: z.string().optional(),

  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

export type QueryBooking = z.infer<typeof QueryBookingSchema>;

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createBookingSchema = z
  .object({
    tenantId: z.number(),

    startDate: z.string(),
    endDate: z.string(),

    note: z.string().optional(),

    occupantsCount: z.number().int().min(1).max(10).optional().default(1),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Check-out must be after check-in",
    path: ["endDate"],
  });

export const CreateBookingInputSchema = createBookingSchema;
export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>;

/*
|--------------------------------------------------------------------------
| PATCH TENANT BOOKING
|--------------------------------------------------------------------------
*/

export const patchTenantBookingSchema = z.object({
  tenantId: z.number(),

  newStartDate: z.string().optional(),
  newEndDate: z.string().optional(),

  cancelReason: z.string().optional(),
});

export const PatchTenantBookingInputSchema = patchTenantBookingSchema;
export type PatchTenantBookingInput = z.infer<
  typeof PatchTenantBookingInputSchema
>;

/*
|--------------------------------------------------------------------------
| APPROVE BOOKING
|--------------------------------------------------------------------------
*/

export const patchApproveBookingSchema = z.object({
  ownerId: z.number(),
  message: z.string().optional(),
});

export const PatchApproveBookingInputSchema = patchApproveBookingSchema;
export type PatchApproveBookingInput = z.infer<
  typeof PatchApproveBookingInputSchema
>;

/*
|--------------------------------------------------------------------------
| REJECT BOOKING
|--------------------------------------------------------------------------
*/

export const patchRejectBookingSchema = z.object({
  ownerId: z.number(),
  reason: z.string(),
});

export const PatchRejectBookingInputSchema = patchRejectBookingSchema;
export type PatchRejectBookingInput = z.infer<
  typeof PatchRejectBookingInputSchema
>;

/*
|--------------------------------------------------------------------------
| PAYMENT PROOF
|--------------------------------------------------------------------------
*/

export const createPaymentProofSchema = z.object({
  tenantId: z.number(),
  note: z.string().optional(),
  paymentImage: ImageUploadSchema,
});

export const CreatePaymentProofInputSchema = createPaymentProofSchema;
export type CreatePaymentProofInput = z.infer<
  typeof CreatePaymentProofInputSchema
>;

/*
|--------------------------------------------------------------------------
| VERIFY PAYMENT
|--------------------------------------------------------------------------
*/

export const patchVerifyPaymentSchema = z.object({
  ownerId: z.number(),
  remarks: z.string().optional(),
  newStatus: BookingStatusEnum.optional(),
});

export const PatchVerifyPaymentInputSchema = patchVerifyPaymentSchema;
export type PatchVerifyPaymentInput = z.infer<
  typeof PatchVerifyPaymentInputSchema
>;

/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelBookingSchema = z.object({
  userId: z.number(),
  role: z.enum(["TENANT", "OWNER"]),
  reason: z.string().optional(),
});

export const CancelBookingInputSchema = cancelBookingSchema;
export type CancelBookingInput = z.infer<typeof CancelBookingInputSchema>;
