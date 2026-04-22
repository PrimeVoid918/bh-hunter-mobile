import { z } from "zod";

export const SubscriptionSchema = z.object({
  id: z.number(),
  ownerId: z.number(),

  type: z.enum(["TRIAL", "PAID"]),

  provider: z.enum(["PAYMONGO"]).nullable(),
  providerReferenceId: z.string().nullable(),

  status: z.enum(["INACTIVE", "ACTIVE", "EXPIRED", "CANCELLED"]),

  startedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  cancelledAt: z.string().datetime().nullable(),

  metadata: z.record(z.any()).nullable(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ActiveSubscription = z.infer<typeof SubscriptionSchema>;
