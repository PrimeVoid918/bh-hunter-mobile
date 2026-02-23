import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CancelBookingInput,
  PatchApproveBookingInput,
  PatchRejectBookingInput,
  PatchVerifyPaymentInput,
} from "./booking.schema";
import {
  CreateBookingInput,
  GetBooking,
  PatchTenantBookingInput,
  QueryBooking,
  QueryBookingSchema,
} from "./booking.schema";
import { ApiResponseType } from "../common/types/api.types";
import { CreatePaymentProofInput } from "./booking.schema";
import { uploadPaymentProof } from "./booking.redux.api.helper";
import { AppImageFile, BackendImage } from "../image/image.schema";

const bookingApiRoute = `api/bookings`;
export const bookingApi = createApi({
  tagTypes: ["Booking"],
  reducerPath: "bookingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    fetchFn: async (Input, init) => {
      return fetch(Input, init);
    },
  }),

  endpoints: (builder) => ({
    getAll: builder.query<GetBooking[], QueryBooking | undefined>({
      query: (params) => {
        const parsed = QueryBookingSchema.safeParse(params ?? {});
        if (!parsed.success) {
          console.error("Invalid query params", parsed.error.format());
          return bookingApiRoute; //* fallback
        }

        const queryParams = new URLSearchParams(
          Object.entries(parsed.data)
            .filter(([_, v]) => v != null)
            .map(([k, v]) => [k, String(v)]),
        );
        return `${bookingApiRoute}?${queryParams.toString()}`;
      },
      transformResponse: (response: { results: GetBooking[] }) =>
        response.results ?? [],
      providesTags: ["Booking"],
    }),
    getOne: builder.query<GetBooking | null, number | undefined>({
      query: (id) => `${bookingApiRoute}/${id}`,
      transformResponse: (response: { results: GetBooking }) =>
        response.results ?? null,

      providesTags: ["Booking"],
    }),

    getBookingPayment: builder.query<
      {
        id: number;
        status: string;
        amount: string;
        currency: string;
        paymentProofId?: string;
      } | null,
      number
    >({
      query: (bookingId) => `${bookingApiRoute}/${bookingId}/payment`,
      transformResponse: (response: { results: any }) =>
        response.results ?? null,
      providesTags: ["Booking"],
    }),
    // getPaymentProof: builder.query<AppImageFile | null, number>({
    //   query: (imageId) => `${bookingApiRoute}/${imageId}/payment-proof`,
    //   transformResponse: (response: ApiResponseType<AppImageFile>) =>
    //     response.results ?? null,
    //   providesTags: ["Booking"],
    // }),

    createBooking: builder.mutation<
      GetBooking,
      { roomId: number; payload: CreateBookingInput }
    >({
      query: ({ payload, roomId }) => ({
        url: `${bookingApiRoute}/${roomId}`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<GetBooking>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),

    patchTenantBooking: builder.mutation<
      GetBooking,
      { id: number; payload: PatchTenantBookingInput }
    >({
      query: ({ id, payload }) => ({
        url: `${bookingApiRoute}/${id}`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<GetBooking>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),
    patchApproveBooking: builder.mutation<
      GetBooking,
      { id: number; payload: PatchApproveBookingInput }
    >({
      query: ({
        id,
        payload,
      }): { url: string; method: string; body: PatchApproveBookingInput } => ({
        url: `${bookingApiRoute}/${id}/owners/approve`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<GetBooking>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),
    patchRejectBooking: builder.mutation<
      GetBooking,
      { id: number; payload: PatchRejectBookingInput }
    >({
      query: ({
        id,
        payload,
      }): { url: string; method: string; body: PatchRejectBookingInput } => ({
        url: `${bookingApiRoute}/${id}/owners/reject`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<GetBooking>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),

    // createPaymentProof: builder.mutation<
    //   GetBooking,
    //   { id: number; payload: CreatePaymentProofInput }
    // >({
    //   async queryFn({ id, payload }) {
    //     try {
    //       const result = await uploadPaymentProof(id, payload);

    //       if (result.success) {
    //         return {
    //           data: result.results, // <-- map properly
    //         };
    //       }

    //       return {
    //         error: {
    //           status: "CUSTOM_ERROR",
    //           error: result.error || "Server rejected",
    //         },
    //       };
    //     } catch (err: any) {
    //       return {
    //         error: {
    //           status: "CUSTOM_ERROR",
    //           error: err.message || "Network error",
    //         },
    //       };
    //     }
    //   },
    //   invalidatesTags: ["Booking"],
    // }),

    patchVerifyPayment: builder.mutation<
      GetBooking,
      { id: number; payload: PatchVerifyPaymentInput }
    >({
      query: ({
        id,
        payload,
      }): { url: string; method: string; body: PatchVerifyPaymentInput } => ({
        url: `${bookingApiRoute}/${id}/owners/verify-payment`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<GetBooking>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),
    cancelBooking: builder.mutation<
      GetBooking,
      { id: number; payload: CancelBookingInput }
    >({
      query: ({
        id,
        payload,
      }): { url: string; method: string; body: CancelBookingInput } => ({
        url: `${bookingApiRoute}/${id}/cancel`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<GetBooking>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),

    // Paymongo integration
    createPaymongoCheckout: builder.mutation<
      {
        paymentId: number;
        clientKey: string;
        checkoutUrl: string;
      },
      { bookingId: number }
    >({
      query: ({ bookingId }) => ({
        url: `${bookingApiRoute}/${bookingId}/paymongo`,
        method: "POST",
      }),
      transformResponse: (
        response: ApiResponseType<{
          paymentId: number;
          clientKey: string;
          checkoutUrl: string;
        }>,
      ) => response.results ?? null,
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetOneQuery,
  useGetBookingPaymentQuery,
  // useGetPaymentProofQuery,
  useCreateBookingMutation,
  usePatchTenantBookingMutation,
  usePatchApproveBookingMutation,
  usePatchRejectBookingMutation,
  // useCreatePaymentProofMutation,
  usePatchVerifyPaymentMutation,
  useCancelBookingMutation,
  useCreatePaymongoCheckoutMutation,
} = bookingApi;
