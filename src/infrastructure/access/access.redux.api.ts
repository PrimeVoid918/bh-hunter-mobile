import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponseType } from "../common/types/api.types";
import { OwnerAccessStatus, TenantAccessStatus } from "./access.schema";

const accessApiRoute = `api/access`;

export const accessApi = createApi({
  reducerPath: "accessApi",
  tagTypes: ["Access"],
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    // fetchFn
  }),

  endpoints: (builder) => ({
    getTenantAccess: builder.query<TenantAccessStatus, { id: number }>({
      query: ({ id }) => `${accessApiRoute}/tenant/${id}`,
      transformResponse: (response: ApiResponseType<TenantAccessStatus>) =>
        response.results ?? {},
    }),
    getOwnerAccess: builder.query<OwnerAccessStatus, { id: number }>({
      query: ({ id }) => `${accessApiRoute}/owner/${id}`,
      transformResponse: (response: ApiResponseType<OwnerAccessStatus>) =>
        response.results ?? {},
    }),
  }),
});

export const {
  useGetTenantAccessQuery,
  useLazyGetOwnerAccessQuery,
  useGetOwnerAccessQuery,
  useLazyGetTenantAccessQuery,
} = accessApi;
