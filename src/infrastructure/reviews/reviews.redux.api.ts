import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponseType } from "../common/types/api.types";

import {
  Review,
  CreateReviewInput,
  UpdateReviewInput,
  ReviewSummary,
} from "./reviews.schema";
// import { Review } from "./reviews.schema";

const reviewApiRoute = `/api/reviews`;

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  tagTypes: ["Review"],
  refetchOnFocus: true,
  refetchOnMountOrArgChange: true,

  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
  }),

  endpoints: (builder) => ({
    /**
     * GET reviews by boarding house
     * GET /api/reviews/boarding-house/:boardingHouseId
     */
    getAll: builder.query<Review[], number>({
      query: (boardingHouseId) =>
        `${reviewApiRoute}/boarding-house/${boardingHouseId}`,

      transformResponse: (response: ApiResponseType<Review[]>) =>
        response.results ?? [],

      providesTags: (result, error, boardingHouseId) =>
        result
          ? [
              ...result.map((r) => ({ type: "Review" as const, id: r.id })),
              { type: "Review", id: `BH-${boardingHouseId}` },
            ]
          : [{ type: "Review", id: `BH-${boardingHouseId}` }],
    }),

    /**
     * GET review stats and ratio in stars
     * GET /api/reviews/boarding-house/:boardingHouseId/summary
     */
    getReviewSummary: builder.query<ReviewSummary, number>({
      query: (boardingHouseId) =>
        `${reviewApiRoute}/boarding-house/${boardingHouseId}/summary`,

      transformResponse: (response: ApiResponseType<ReviewSummary>) =>
        response.results ?? {
          average: 0,
          total: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },

      // Use a single tag per boarding house summary
      providesTags: (result, error, boardingHouseId) => [
        { type: "Review", id: `BH-${boardingHouseId}-SUMMARY` },
      ],
    }),

    /**
     * CREATE review
     * POST /api/reviews/boarding-house/:boardingHouseId
     */
    create: builder.mutation<
      Review,
      { boardingHouseId: number; data: CreateReviewInput }
    >({
      query: ({ boardingHouseId, data }) => ({
        url: `${reviewApiRoute}/boarding-house/${boardingHouseId}`,
        method: "POST",
        body: data,
      }),

      invalidatesTags: (result, error, { boardingHouseId }) => [
        { type: "Review", id: `BH-${boardingHouseId}-SUMMARY` },
      ],
    }),

    /**
     * UPDATE review
     * PATCH /api/reviews/:id
     */
    patch: builder.mutation<
      Review,
      { id: number; boardingHouseId: number; data: UpdateReviewInput }
    >({
      query: ({ id, data }) => ({
        url: `${reviewApiRoute}/${id}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (result, error, { id, boardingHouseId }) => [
        { type: "Review", id },
        { type: "Review", id: `BH-${boardingHouseId}-SUMMARY` },
        { type: "Review", id: `BH-${boardingHouseId}` },
      ],
    }),

    /**
     * DELETE review (soft or hard)
     * DELETE /api/reviews/:id
     */
    delete: builder.mutation<
      { success: boolean },
      { id: number; boardingHouseId: number }
    >({
      query: ({ id }) => ({
        url: `${reviewApiRoute}/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, { id, boardingHouseId }) => [
        { type: "Review", id },
        { type: "Review", id: `BH-${boardingHouseId}` },
        { type: "Review", id: `BH-${boardingHouseId}-SUMMARY` },
      ],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetReviewSummaryQuery,
  useCreateMutation,
  usePatchMutation,
  useDeleteMutation,
} = reviewsApi;
