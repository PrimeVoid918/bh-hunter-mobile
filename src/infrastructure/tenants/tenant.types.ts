import { z } from "zod";
import { BaseUserSchema } from "../user/user.types";
import { bookingSchema } from "../booking/booking.schema";
import {
  RegistrationStatusSchema,
  VerificationLevelSchema,
} from "../valid-docs/verification-document/verification-document.schema";

/** ---------------- SCHEMAS ---------------- **/

// TenantSchema = BaseUser + tenant-specific fields
export const TenantSchema = BaseUserSchema.extend({
  role: z.literal("TENANT").optional(),
  guardian: z.string().nullable().optional(),
  bookings: z.array(bookingSchema).optional(),
});

/** RegisterTenant — minimal self-registration (like Owner’s Register) */
export const RegisterTenantSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** UpdateTenant — all fields optional */
export const UpdateTenantSchema = TenantSchema.partial();

/** GetTenant — fully loaded entity */
export const GetTenantSchema = TenantSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type Tenant = z.infer<typeof TenantSchema>;
export type RegisterTenant = z.infer<typeof RegisterTenantSchema>;
export type UpdateTenant = z.infer<typeof UpdateTenantSchema>;
export type GetTenant = z.infer<typeof GetTenantSchema>;

/*
{
  "tenantId": 4,
  "isVerified": true,
  "verificationLevel": "FULLY_VERIFIED",
  "canBookRoom": true,
  "canSendMessage": true
}
*/
