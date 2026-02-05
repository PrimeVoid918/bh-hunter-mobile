import { z } from "zod";

/**
 * Shared primitives
 */
export const ReviewRatingSchema = z
  .number()
  .int()
  .min(1, "Rating must be between 1 and 5")
  .max(5, "Rating must be between 1 and 5");

/**
 * Base Review schema (mirrors Prisma model)
 */
export const ReviewSchema = z.object({
  id: z.number().int(),

  tenantId: z.number().int(),
  boardingHouseId: z.number().int(),
  tenant: z.object({
    username: z.string(),
  }),

  rating: ReviewRatingSchema,
  comment: z.string().min(1).optional().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().optional().nullable(),
});

/**
 * CREATE review
 * - boardingHouseId comes from route param
 * - tenantId comes from body or auth context
 */
export const CreateReviewSchema = z.object({
  tenantId: z.number().int(),
  rating: ReviewRatingSchema,
  comment: z.string().min(1).optional(),
});

/**
 * UPDATE review
 */
export const UpdateReviewSchema = z.object({
  rating: ReviewRatingSchema.optional(),
  comment: z.string().min(1).optional(),
});

/**
 * Types
 */
export type Review = z.infer<typeof ReviewSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;

/**
 * Aggregated / derived output (not stored in Prisma)
 */
export const ReviewSummarySchema = z.object({
  average: z.number().min(1).max(5),
  total: z.number().int().nonnegative(),
  distribution: z.object({
    1: z.number().int().nonnegative(),
    2: z.number().int().nonnegative(),
    3: z.number().int().nonnegative(),
    4: z.number().int().nonnegative(),
    5: z.number().int().nonnegative(),
  }),
});

export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;
