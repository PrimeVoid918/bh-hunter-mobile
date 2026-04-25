import { z } from "zod";

export const AgreementStatusEnum = z.enum([
  "PENDING",
  "ACCEPTED",
  "PDF_GENERATED",
  "VOIDED",
]);

export type AgreementStatus = z.infer<typeof AgreementStatusEnum>;

export const AgreementRuleSchema = z.object({
  id: z.number(),
  boardingHouseId: z.number().optional(),

  title: z.string(),
  content: z.string(),

  isRequired: z.boolean(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  version: z.number().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AgreementRule = z.infer<typeof AgreementRuleSchema>;

export const AgreementPreviewSchema = z.object({
  roomId: z.number(),
  tenantId: z.number(),
  boardingHouseId: z.number(),
  ownerId: z.number(),

  preview: z.object({
    tenantName: z.string(),
    ownerName: z.string(),
    boardingHouseName: z.string(),
    boardingHouseAddress: z.string().nullable().optional(),
    roomNumber: z.string(),
    roomPrice: z.number(),
    occupantsCount: z.number(),
    totalAmount: z.number(),
    checkInDate: z.string(),
    checkOutDate: z.string(),
  }),

  rules: z.array(AgreementRuleSchema),
  termsVersion: z.string(),
  disclaimer: z.string(),
});

export type AgreementPreview = z.infer<typeof AgreementPreviewSchema>;

export const BookingAgreementSummarySchema = z.object({
  id: z.number(),
  bookingId: z.number(),

  tenantId: z.number(),
  ownerId: z.number(),
  boardingHouseId: z.number(),
  roomId: z.number(),

  status: AgreementStatusEnum,
  termsVersion: z.string(),

  tenantAcceptedAt: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),

  snapshot: z.any().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BookingAgreementSummary = z.infer<
  typeof BookingAgreementSummarySchema
>;

export const AgreementPdfPayloadSchema = z.object({
  bookingId: z.number(),
  filename: z.string(),
  html: z.string(),
  snapshot: z.any(),
  agreement: BookingAgreementSummarySchema,
});

export type AgreementPdfPayload = z.infer<typeof AgreementPdfPayloadSchema>;

export const AgreementReviewInfoSchema = z.object({
  bookingId: z.number(),
  agreementId: z.number(),

  agreementStatus: AgreementStatusEnum,

  acceptedTermsVersion: z.string(),
  currentTermsVersion: z.string(),
  hasNewRules: z.boolean(),

  tenantAcceptedAt: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  htmlUrl: z.string(),

  currentRules: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      content: z.string(),
      isRequired: z.boolean(),
      version: z.number().optional(),
    }),
  ),

  message: z.string(),
});

export type AgreementReviewInfo = z.infer<typeof AgreementReviewInfoSchema>;
