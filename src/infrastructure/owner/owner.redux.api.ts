import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponseType } from "../common/types/api.types";
import {
  Owner,
  RegisterOwner,
  UpdateOwner,
  GetOwner,
  OwnerAccessStatus,
} from "./owner.types";

const ownerApiRoute = `/api/owners`;

export const ownerApi = createApi({
  reducerPath: "ownersApi",
  tagTypes: ["Owner"],
  refetchOnFocus: true,
  refetchOnMountOrArgChange: true,
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
  }),

  endpoints: (builder) => ({
    getAll: builder.query<GetOwner[], void>({
      query: () => ownerApiRoute,
      transformResponse: (response: ApiResponseType<GetOwner[]>) =>
        response.results ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Owner" as const, id })),
              { type: "Owner", id: "LIST" },
            ]
          : [{ type: "Owner", id: "LIST" }],
    }),

    getOne: builder.query<GetOwner, number>({
      query: (id) => `${ownerApiRoute}/${id}`,
      transformResponse: (response: ApiResponseType<GetOwner>) =>
        response.results!,
      providesTags: (result, error, id) => [{ type: "Owner", id }],
    }),

    getAccessStatus: builder.query<OwnerAccessStatus, number>({
      query: (id) => `${ownerApiRoute}/${id}/access-status`,
      transformResponse: (response: ApiResponseType<OwnerAccessStatus>) =>
        response.results!,
      providesTags: (result, error, id) => [{ type: "Owner", id }],
    }),

    /** ----------- MUTATIONS ----------- */
    create: builder.mutation<GetOwner, RegisterOwner>({
      query: (data) => ({
        url: ownerApiRoute,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Owner", id: "LIST" }],
    }),

    patch: builder.mutation<GetOwner, { id: number; data: UpdateOwner }>({
      query: ({ id, data }) => ({
        url: `${ownerApiRoute}/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Owner", id }],
    }),

    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `${ownerApiRoute}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Owner", id },
        { type: "Owner", id: "LIST" },
      ],
    }),
  }),
});

/** ----------- HOOK EXPORTS ----------- */
export const {
  useGetAllQuery,
  useGetOneQuery,
  useGetAccessStatusQuery,
  useCreateMutation,
  usePatchMutation,
  useDeleteMutation,
} = ownerApi;
