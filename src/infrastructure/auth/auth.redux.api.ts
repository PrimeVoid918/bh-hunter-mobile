import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthUser, LoginResults } from "./auth.types";
import { ApiResponseType } from "../common/types/api.types";

const authApiRoute = `/api/auth`;
export const authApi = createApi({
  tagTypes: ["Auth"],
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    // skips the fetchFn that logs, for debugging only
    //  fetchFn: async (input, init) => {
    //   console.log("FETCHING URL:", input);
    //   console.log("FETCH INIT:", init);
    //   return fetch(input, init);
    // },
  }),

  endpoints: (builder) => ({
    login: builder.mutation<LoginResults, Partial<AuthUser>>({
      query: (data) => ({
        url: `${authApiRoute}/login`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponseType<LoginResults>) =>
        response.results ?? [],
    }),
    validateJwtToken: builder.query<
      { userId: string; role: string },
      { token: string }
    >({
      query: ({ token }) => ({
        url: `${authApiRoute}/validate`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      transformResponse: (
        response: ApiResponseType<{ userId: string; role: string }>,
      ) => response.results ?? { userId: "", role: "" },
    }),
    // TODO: expand here later and should meet with backend interface
  }),
});
//* Export hooks for usage in funcitonal components
export const { useLoginMutation, useValidateJwtTokenQuery } = authApi;
