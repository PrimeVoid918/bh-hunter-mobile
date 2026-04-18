import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponseType } from "../common/types/api.types";
import {
  Tenant,
  RegisterTenant,
  UpdateTenant,
  GetTenant,
  TenantAccessStatus,
} from "./tenant.types";

const tenantApiRoute = `/api/tenants`;
export const tenantApi = createApi({
  reducerPath: "tenantsApi",
  tagTypes: ["Tenant", "AccessStatus"],
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    fetchFn: async (input, init) => {
      console.log("FETCHING URL:", input);
      console.log("FETCH INIT:", init);
      return fetch(input, init);
    },
  }),

  endpoints: (builder) => ({
    /** Get all tenants */
    getAll: builder.query<Tenant[], void>({
      query: () => tenantApiRoute,
      transformResponse: (response: ApiResponseType<Tenant[]>) =>
        response.results ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Tenant" as const, id })),
              { type: "Tenant", id: "LIST" },
            ]
          : [{ type: "Tenant", id: "LIST" }],
    }),

    getOne: builder.query<Tenant, number>({
      query: (id) => `${tenantApiRoute}/${id}`,
      transformResponse: (response: ApiResponseType<Tenant>) =>
        response.results ?? null,
      providesTags: (result, error, id) => [{ type: "Tenant", id }],
    }),

    // Create tenant
    create: builder.mutation<Tenant, RegisterTenant>({
      query: (data) => ({
        url: tenantApiRoute,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Tenant", id: "LIST" }],
    }),

    // Patch tenant
    patch: builder.mutation<GetTenant, { id: number; data: UpdateTenant }>({
      query: ({ id, data }) => ({
        url: `${tenantApiRoute}/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tenant", id },
        { type: "Tenant", id: "LIST" },
      ],
    }),

    /** Delete tenant */
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `${tenantApiRoute}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Tenant", id },
        { type: "Tenant", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetOneQuery,
  useCreateMutation,
  usePatchMutation,
  useDeleteMutation,
} = tenantApi;
