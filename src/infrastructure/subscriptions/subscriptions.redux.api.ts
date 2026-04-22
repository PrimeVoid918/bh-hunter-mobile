import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponseType } from "../common/types/api.types";
import { ActiveSubscription } from "./subscriptions.schema";

const subscriptionApiRoute = `api/subscriptions`;

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  tagTypes: ["Subscription"],
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    // fetchFn
  }),

  endpoints: (builder) => ({
    getOwnerActiveSubscription: builder.query<
      ActiveSubscription,
      { id: number }
    >({
      query: ({ id }) => `${subscriptionApiRoute}/active/${id}`,
      transformResponse: (response: ApiResponseType<ActiveSubscription>) =>
        response.results ?? {},
    }),
  }),
});

export const {
  useLazyGetOwnerActiveSubscriptionQuery,
  useGetOwnerActiveSubscriptionQuery,
} = subscriptionApi;
