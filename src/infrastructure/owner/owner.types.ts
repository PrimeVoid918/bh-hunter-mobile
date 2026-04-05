import { z } from "zod";
import { BaseUserSchema } from "../user/user.types";
// import { BoardingHousesIdListSchema } from "../boarding-houses/boarding-house.types";

/** ---------------- SCHEMAS ---------------- **/

export const OwnerSchema = BaseUserSchema.extend({
  role: z.literal("OWNER").optional(),
  // boardingHouses: z.array(BoardingHousesIdListSchema).optional(),
});

/** RegisterOwner — no id, no timestamps */
export const RegisterOwnerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** UpdateOwner — partial */
export const UpdateOwnerSchema = BaseUserSchema.partial();

/** GetOwner — fully loaded entity (id + timestamps enforced) */
export const GetOwnerSchema = OwnerSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

/** ---------------- TYPES ---------------- **/

export type Owner = z.infer<typeof OwnerSchema>;
export type RegisterOwner = z.infer<typeof RegisterOwnerSchema>;
export type UpdateOwner = z.infer<typeof UpdateOwnerSchema>;
export type GetOwner = z.infer<typeof GetOwnerSchema>;

export const SubscriptionSchema = z.object({
  id: z.number(),
  type: z.enum(["TRIAL", "MONTHLY", "YEARLY"]),
  startedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  provider: z.string().optional(),
});

export const OwnerAccessStatusSchema = z.object({
  ownerId: z.number(),

  isVerified: z.boolean(),
  verificationLevel: z.string(),

  hasActiveSubscription: z.boolean(),

  subscription: SubscriptionSchema.nullable(),

  canCreateBoardingHouse: z.boolean(),
  canCreateRoom: z.boolean(),

  shouldPurchasePlan: z.boolean(),
});

export type OwnerAccessStatus = z.infer<typeof OwnerAccessStatusSchema>;
