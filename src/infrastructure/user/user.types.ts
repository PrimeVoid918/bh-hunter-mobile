import { z } from "zod";

/** Shared UserRole enum */
export const UserRoleSchema = z.enum(["TENANT", "OWNER", "ADMIN", "GUEST"]);
export type UserRole = z.infer<typeof UserRoleSchema>;
export const UserRoleEnum = UserRoleSchema.enum;

/** BaseUser (decoupled, minimal shape) */
export const BaseUserSchema = z.object({
  id: z.number().int().positive().optional(),
  username: z.string().min(1).optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email().optional(),
  role: UserRoleSchema.optional(),
  hasAcceptedLegitimacyConsent: z.boolean().optional(),
  consentAcceptedAt: z.string().datetime({ offset: true }).optional(),
  isActive: z.boolean().optional(),

  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
  age: z.number().int().optional(),
  address: z.string().optional(),
  phone_number: z.string().optional(),
});
export type BaseUser = z.infer<typeof BaseUserSchema>;

export const roleToSliceMap = {
  TENANT: "tenants",
  OWNER: "owners",
  ADMIN: "admins",
  GUEST: "GUEST",
} as const;
