import { z } from "zod";
import { GetTenantSchema } from "../tenants/tenant.types";
import { ImageUploadSchema } from "../image/image.schema";
import { GetRoomSchema } from "../room/rooms.schema";
import { BookingAgreementSummarySchema } from "../agreements/agreements.schema";

/*
|--------------------------------------------------------------------------
| ENUMS
|--------------------------------------------------------------------------
*/

export const BookingTypeEnum = z.enum([
  "RESERVATION",
  "INSTANT",
  "HOLD",
  "LONG_TERM",
  "SHORT_TERM",
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

// export const BookingStatusSchema = z.object({
//   bookingId: z.number(),
//   bookingStatus: BookingStatusEnum,
//   paymentStatus: PaymentStatusEnum.nullable(),
//   refund: BookingRefundInfoSchema.nullable(),
// });

// export type BookingStatusResponse = z.infer<typeof BookingStatusSchema>;

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

  agreement: BookingAgreementSummarySchema.optional(),

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
| ACTIVE
|--------------------------------------------------------------------------
*/

export const ActiveBookingSchema = GetBookingSchema.pick({
  id: true,
  reference: true,
  tenantId: true,
  roomId: true,
  status: true,
  checkInDate: true,
  checkOutDate: true,
  createdAt: true,
  updatedAt: true,
  room: true,
  boardingHouse: true,
});

export type ActiveBooking = z.infer<typeof ActiveBookingSchema>;

export const StayStatusSchema = z.object({
  active: ActiveBookingSchema.nullable(),
  upcoming: ActiveBookingSchema.nullable(),
});

export type StayStatus = z.infer<typeof StayStatusSchema>;

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

    tenantAcceptedTerms: z.boolean(),

    termsVersion: z.string().optional(),
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

// export const patchApproveBookingSchema = z.object({
//   ownerId: z.number(),
//   message: z.string().optional(),
// });

// export const PatchApproveBookingInputSchema = patchApproveBookingSchema;
// export type PatchApproveBookingInput = z.infer<
//   typeof PatchApproveBookingInputSchema
// >;

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

export const BookingChargeTypeEnum = z.enum([
  "RESERVATION_FEE",
  "ADVANCE_PAYMENT",
  "DEPOSIT",
  "EXTENSION_PAYMENT",
]);

export const patchApproveBookingSchema = z.object({
  ownerId: z.coerce.number(),
  message: z.string().optional(),
  reservationFee: z.coerce.number().min(0),
  advancePayment: z.coerce.number().min(0),
  securityDeposit: z.coerce.number().min(0).optional().default(0),
});

export const PatchApproveBookingInputSchema = patchApproveBookingSchema;
export type PatchApproveBookingInput = z.infer<
  typeof PatchApproveBookingInputSchema
>;

const MoneySchema = z.union([z.string(), z.number()]);

export const BookingChargeStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "CANCELLED",
  "REFUNDED",
  "EXPIRED",
]);

export const BookingChargeSummarySchema = z.object({
  id: z.number(),
  type: BookingChargeTypeEnum,
  status: BookingChargeStatusEnum,
  amount: MoneySchema,
  dueDate: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  paymentStatus: PaymentStatusEnum.nullable().optional(),
});

export const NextPendingChargeSchema = z.object({
  id: z.number(),
  type: BookingChargeTypeEnum,
  amount: MoneySchema,
  dueDate: z.string().nullable().optional(),
  paymentStatus: PaymentStatusEnum.nullable().optional(),
});

// export const BookingStatusSchema = z.object({
//   bookingId: z.number(),
//   bookingStatus: BookingStatusEnum,
//   confirmedAt: z.string().nullable().optional(),
//   nextPendingCharge: NextPendingChargeSchema.nullable(),
//   charges: z.array(BookingChargeSummarySchema),
//   totals: z.object({
//     totalCharges: z.number(),
//     paidCharges: z.number(),
//     remainingCharges: z.number(),
//   }),
// });
export const BookingStatusSchema = z.object({
  bookingId: z.number(),
  bookingStatus: BookingStatusEnum,
  confirmedAt: z.string().nullable().optional(),
  nextPendingCharge: NextPendingChargeSchema.nullable(),
  charges: z.array(BookingChargeSummarySchema),

  // add this
  extensionRequest: z.any().nullable().optional(),

  totals: z.object({
    totalCharges: z.number(),
    paidCharges: z.number(),
    remainingCharges: z.number(),
  }),
});

export type BookingStatusResponse = z.infer<typeof BookingStatusSchema>;

export const ApproveBookingResponseSchema = GetBookingSchema.extend({
  firstCharge: z.object({
    id: z.number(),
    type: BookingChargeTypeEnum,
    amount: MoneySchema,
    dueDate: z.string().nullable().optional(),
    sequence: z.number(),
  }),
  paymentClientSecret: z.string(),
});

export type ApproveBookingResponse = z.infer<
  typeof ApproveBookingResponseSchema
>;

/*
|--------------------------------------------------------------------------
| EXTENSION
|--------------------------------------------------------------------------
*/

export const BookingExtensionStatusEnum = z.enum([
  "PENDING",
  "APPROVED_AWAITING_PAYMENT",
  "REJECTED",
  "PAID",
  "CANCELLED",
]);

export type BookingExtensionStatus = z.infer<typeof BookingExtensionStatusEnum>;

export const BookingChargeDetailSchema = z.object({
  id: z.number(),
  bookingId: z.number(),
  type: BookingChargeTypeEnum,
  status: BookingChargeStatusEnum,
  amount: MoneySchema,
  currency: z.string(),
  sequence: z.number(),
  isRequired: z.boolean(),
  dueDate: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BookingExtensionRequestSchema = z.object({
  id: z.number(),
  bookingId: z.number(),
  tenantId: z.number(),
  ownerId: z.number(),
  currentCheckOutDate: z.string(),
  requestedCheckOutDate: z.string(),
  status: BookingExtensionStatusEnum,
  reason: z.string().nullable().optional(),
  ownerMessage: z.string().nullable().optional(),
  extensionChargeId: z.number().nullable().optional(),
  approvedAt: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BookingExtensionRequest = z.infer<
  typeof BookingExtensionRequestSchema
>;

export const RequestExtensionInputSchema = z.object({
  tenantId: z.number(),
  requestedCheckOutDate: z.string(),
  reason: z.string().optional(),
});

export type RequestExtensionInput = z.infer<typeof RequestExtensionInputSchema>;

export const ExtensionAdjustmentInputSchema = z.object({
  label: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export const ApproveExtensionInputSchema = z.object({
  ownerId: z.coerce.number(),
  extensionAmount: z.coerce.number().positive(),
  message: z.string().optional(),
  adjustments: z.array(ExtensionAdjustmentInputSchema).optional().default([]),
});

export type ApproveExtensionInput = z.infer<typeof ApproveExtensionInputSchema>;

export const RejectExtensionInputSchema = z.object({
  ownerId: z.coerce.number(),
  reason: z.string().optional(),
});

export type RejectExtensionInput = z.infer<typeof RejectExtensionInputSchema>;

export const ApproveExtensionResponseSchema = z.object({
  // extensionRequest: BookingExtensionRequestSchema,
  extensionRequest: BookingExtensionRequestSchema.nullable().optional(),
  extensionCharge: BookingChargeDetailSchema,
});

export type ApproveExtensionResponse = z.infer<
  typeof ApproveExtensionResponseSchema
>;

/*
|--------------------------------------------------------------------------
| BOOKING PAYMENT
|--------------------------------------------------------------------------
*/

export const BookingPaymentPendingSchema = z.object({
  paymentId: z.number(),
  bookingChargeId: z.number(),
  chargeType: BookingChargeTypeEnum,
  amount: MoneySchema,
  status: PaymentStatusEnum.optional(),
  providerPaymentIntentId: z.string().optional(),
  clientSecret: z.string().optional(),
  canRetry: z.boolean(),
});

export const BookingPaymentCompletedSchema = z.object({
  bookingId: z.number(),
  completed: z.literal(true),
  bookingStatus: BookingStatusEnum,
  message: z.string(),
});

export const BookingPaymentResponseSchema = z.union([
  BookingPaymentPendingSchema,
  BookingPaymentCompletedSchema,
]);

export type BookingPaymentResponse = z.infer<
  typeof BookingPaymentResponseSchema
>;

export const BookingChargeCheckoutResponseSchema = z.object({
  paymentId: z.number(),
  bookingChargeId: z.number(),
  chargeType: BookingChargeTypeEnum,
  amount: MoneySchema,
  checkoutUrl: z.string(),
});

export type BookingChargeCheckoutResponse = z.infer<
  typeof BookingChargeCheckoutResponseSchema
>;

/*
|--------------------------------------------------------------------------
| BILLING STATEMENTS
|--------------------------------------------------------------------------
*/

export const BillingStatementTypeEnum = z.enum([
  "INITIAL_BOOKING",
  "EXTENSION",
]);

export const BillingStatementStatusEnum = z.enum([
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "REFUNDED",
  "CANCELLED",
  "EXPIRED",
]);

export const BillingStatementItemSchema = z.object({
  chargeId: z.number(),
  type: z.string(),
  label: z.string(),
  description: z.string(),

  amount: z.number(),
  amountText: z.string(),

  status: z.string(),
  paymentStatus: z.string().nullable().optional(),

  dueDate: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
});

export const BillingStatementTotalsSchema = z.object({
  totalAmount: z.number(),
  totalAmountText: z.string(),

  amountPaid: z.number(),
  amountPaidText: z.string(),

  refundedAmount: z.number(),
  refundedAmountText: z.string(),

  remainingBalance: z.number(),
  remainingBalanceText: z.string(),
});

export const BillingStatementSchema = z.object({
  statementNumber: z.string(),
  type: BillingStatementTypeEnum,
  title: z.string(),
  subtitle: z.string(),

  status: BillingStatementStatusEnum,

  /**
   * Example:
   * /api/bookings/1/billing-statements/html?type=INITIAL_BOOKING
   * /api/bookings/1/billing-statements/html?type=EXTENSION&chargeId=4
   */
  htmlPath: z.string(),

  extensionChargeId: z.number().nullable().optional(),
  extensionRequestId: z.number().nullable().optional(),

  currentCheckOutDate: z.string().nullable().optional(),
  requestedCheckOutDate: z.string().nullable().optional(),

  items: z.array(BillingStatementItemSchema),
  totals: BillingStatementTotalsSchema,
});

export const BookingBillingStatementsResponseSchema = z.object({
  bookingId: z.number(),
  bookingStatus: BookingStatusEnum,
  generatedAt: z.string(),

  initialBillingStatement: BillingStatementSchema.nullable(),
  extensionBillingStatements: z.array(BillingStatementSchema),

  summary: z.object({
    totalStatements: z.number(),

    totalAmount: z.number(),
    totalAmountText: z.string(),

    totalPaid: z.number(),
    totalPaidText: z.string(),

    totalRefunded: z.number(),
    totalRefundedText: z.string(),

    totalRemaining: z.number(),
    totalRemainingText: z.string(),
  }),
});

export type BillingStatementType = z.infer<typeof BillingStatementTypeEnum>;
export type BillingStatementStatus = z.infer<typeof BillingStatementStatusEnum>;
export type BillingStatementItem = z.infer<typeof BillingStatementItemSchema>;
export type BillingStatementTotals = z.infer<
  typeof BillingStatementTotalsSchema
>;
export type BillingStatement = z.infer<typeof BillingStatementSchema>;
export type BookingBillingStatementsResponse = z.infer<
  typeof BookingBillingStatementsResponseSchema
>;
