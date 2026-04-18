import { z } from "zod";
import { RegistrationStatusSchema } from "../valid-docs/verification-document/verification-document.schema";

export const VerificationLevelSchema = z.enum([
  "UNVERIFIED",
  "PROFILE_ONLY",
  "FULLY_VERIFIED",
]);

export const SubscriptionStatusSchema = z.enum([
  "INACTIVE",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
]);

export const OwnerAccessStatusSchema = z.object({
  ownerId: z.number(),

  isVerified: z.boolean(),
  subscriptionActive: z.boolean(),

  canCreateBoardingHouse: z.boolean(),
  canManageRooms: z.boolean(),
  canApproveBookings: z.boolean(),
  canReceivePayments: z.boolean(),
  canRequestPayout: z.boolean(),

  verificationLevel: VerificationLevelSchema,
  subscriptionStatus: SubscriptionStatusSchema,
});

export type OwnerAccessStatus = z.infer<typeof OwnerAccessStatusSchema>;

export const TenantAccessStatusSchema = z.object({
  tenantId: z.number(),

  isVerified: z.boolean(),
  verificationLevel: VerificationLevelSchema,
  registrationStatus: RegistrationStatusSchema,

  canBookRoom: z.boolean(),
  canMakeReview: z.boolean(),
  canSendMessage: z.boolean(),
});

export type TenantAccessStatus = z.infer<typeof TenantAccessStatusSchema>;

export type AccessStatus = TenantAccessStatus | OwnerAccessStatus;

export const isOwnerAccess = (
  access: AccessStatus,
): access is OwnerAccessStatus => {
  return "ownerId" in access;
};

export const isTenantAccess = (
  access: AccessStatus,
): access is TenantAccessStatus => {
  return "tenantId" in access;
};
