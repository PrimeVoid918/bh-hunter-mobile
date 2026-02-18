import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  GetNotification,
  PatchMarkAsReadInput,
  PatchMarkAsReadSchema,
  QueryNotification,
  QueryNotificationSchema,
  // PatchMarkAsReadInput,
} from "./notifications.schema";

import { ApiResponseType } from "../common/types/api.types";

const notificationApiRoute = `api/notifications`;

export const notificationApi = createApi({
  tagTypes: ["Notification"],
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    fetchFn: async (input, init) => {
      return fetch(input, init);
    },
  }),

  endpoints: (builder) => ({
    /* =========================================================
       GET ALL NOTIFICATIONS
    ========================================================= */
    getAll: builder.query<GetNotification[], QueryNotification | undefined>({
      query: (params) => {
        const parsed = QueryNotificationSchema.safeParse(params ?? {});
        if (!parsed.success) {
          console.error(
            "Invalid notification query params",
            parsed.error.format(),
          );
          return notificationApiRoute; // fallback
        }

        const queryParams = new URLSearchParams(
          Object.entries(parsed.data)
            .filter(([_, v]) => v != null)
            .map(([k, v]) => [k, String(v)]),
        );

        return `${notificationApiRoute}?${queryParams.toString()}`;
      },

      transformResponse: (response: ApiResponseType<GetNotification[]>) =>
        response.results ?? [],

      providesTags: ["Notification"],
    }),

    markAsRead: builder.mutation<
      { count: number },
      { id: number; params: PatchMarkAsReadInput }
    >({
      query: ({ id, params }) => {
        const parsed = PatchMarkAsReadSchema.safeParse(params);

        if (!parsed.success) {
          console.error("Gi Invalidate si Mark :(", parsed.error.format());
          return `${notificationApiRoute}/${id}/read`;
        }

        // console.error("Invalid markAsRead params", parsed.error.format());
        const queryParams = new URLSearchParams(
          Object.entries(parsed.data).map(([k, v]) => [k, String(v)]),
        );

        return {
          url: `${notificationApiRoute}/${id}/read?${queryParams.toString()}`,
          method: "PATCH",
        };
      },

      transformResponse: (response: { results: { count: number } }) =>
        response.results ?? { count: 0 },

      invalidatesTags: ["Notification"],
    }),

    /* =========================================================
       MARK ALL AS READ
    ========================================================= */
    // markAllAsRead: builder.mutation<{ count: number }, PatchMarkAsReadInput>({
    //   query: (payload) => ({
    //     url: `${notificationApiRoute}/read-all`,
    //     method: "PATCH",
    //     body: payload,
    //   }),

    //   transformResponse: (response: ApiResponseType<{ count: number }>) =>
    //     response.results ?? { count: 0 },

    //   invalidatesTags: ["Notification"],
    // }),
  }),
});

export const { useGetAllQuery, useMarkAsReadMutation } = notificationApi;
