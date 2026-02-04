import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponseType } from "../common/types/api.types";
import {
  Tenant,
  RegisterTenant,
  UpdateTenant,
  GetTenant,
} from "./tenant.types";

/** ---------------- ROUTE ---------------- **/
const tenantApiRoute = `/api/tenants`;

/** ---------------- API ---------------- **/
export const tenantApi = createApi({
  tagTypes: ["Tenant"],
  reducerPath: "tenantsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    // For debugging requests
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
    }),

    /** Get one tenant by id */
    getOne: builder.query<Tenant, number>({
      query: (id) => `${tenantApiRoute}/${id}`,
      transformResponse: (response: ApiResponseType<Tenant>) =>
        response.results ?? null,
      providesTags: (result, error, id) => [{ type: "Tenant", id }],
    }),

    /** Register tenant (self-signup) */
    create: builder.mutation<Tenant, RegisterTenant>({
      query: (data) => ({
        url: tenantApiRoute,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tenant"],
    }),

    /** Update tenant (PATCH) */
    patch: builder.mutation<GetTenant, { id: number; data: UpdateTenant }>({
      query: ({ id, data }) => ({
        url: `${tenantApiRoute}/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tenant"],
    }),

    /** Delete tenant */
    delete: builder.mutation<Tenant, number>({
      query: (id) => ({
        url: `${tenantApiRoute}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tenant"],
    }),
  }),
});

/** ---------------- HOOKS ---------------- **/
export const {
  useGetAllQuery,
  useGetOneQuery,
  useCreateMutation,
  usePatchMutation,
  useDeleteMutation,
} = tenantApi;
