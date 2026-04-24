import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ApproveBookingResponse,
  ApproveExtensionInput,
  ApproveExtensionResponse,
  BookingChargeCheckoutResponse,
  BookingExtensionRequest,
  BookingPaymentResponse,
  BookingStatusResponse,
  CancelBookingInput,
  PatchApproveBookingInput,
  PatchRejectBookingInput,
  PatchVerifyPaymentInput,
  RefundPreview,
  RejectExtensionInput,
  RequestExtensionInput,
  StayStatus,
} from "./booking.schema";
import {
  CreateBookingInput,
  GetBooking,
  PatchTenantBookingInput,
  QueryBooking,
  QueryBookingSchema,
} from "./booking.schema";
import { ApiResponseType } from "../common/types/api.types";
import { ActiveBooking } from "./booking.schema";

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
      transformResponse: (response: ApiResponseType<GetBooking[]>) =>
        response.results ?? [],
      providesTags: ["Booking"],
    }),

    getOne: builder.query<GetBooking | null, number | undefined>({
      query: (id) => `${bookingApiRoute}/${id}`,
      transformResponse: (response: ApiResponseType<GetBooking>) =>
        response.results ?? null,

      providesTags: ["Booking"],
    }),

    getActive: builder.query<StayStatus | null, number | undefined>({
      query: (id) => `${bookingApiRoute}/tenant/${id}/active`,
      transformResponse: (response: ApiResponseType<StayStatus>) =>
        response.results ?? null,

      providesTags: ["Booking"],
    }),

    getBookingPayment: builder.query<BookingPaymentResponse | null, number>({
      query: (bookingId) => `${bookingApiRoute}/${bookingId}/payment`,
      transformResponse: (response: ApiResponseType<BookingPaymentResponse>) =>
        response.results ?? null,
      providesTags: ["Booking"],
    }),

    getBookingStatus: builder.query<
      BookingStatusResponse | null,
      number | undefined
    >({
      query: (id) => `${bookingApiRoute}/${id}/status`,
      transformResponse: (response: ApiResponseType<BookingStatusResponse>) =>
        response.results ?? null,
      providesTags: ["Booking"],
    }),

    getRefundPreview: builder.query<RefundPreview | null, { id: number }>({
      query: ({ id }) => `${bookingApiRoute}/${id}/refund-preview`,
      keepUnusedDataFor: 0,
      transformResponse: (response: ApiResponseType<RefundPreview>) =>
        response.results ?? null,
      providesTags: ["Booking"],
    }),

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
    //! reworked backend
    // patchApproveBooking: builder.mutation<
    //   GetBooking,
    //   { id: number; payload: PatchApproveBookingInput }
    // >({
    //   query: ({
    //     id,
    //     payload,
    //   }): { url: string; method: string; body: PatchApproveBookingInput } => ({
    //     url: `${bookingApiRoute}/${id}/owners/approve`,
    //     method: "PATCH",
    //     body: payload,
    //   }),
    //   transformResponse: (response: ApiResponseType<GetBooking>) =>
    //     response.results ?? null,
    //   invalidatesTags: ["Booking"],
    // }),
    patchApproveBooking: builder.mutation<
      ApproveBookingResponse,
      { id: number; payload: PatchApproveBookingInput }
    >({
      query: ({ id, payload }) => ({
        url: `${bookingApiRoute}/${id}/owners/approve`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<ApproveBookingResponse>) =>
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

    //! temporarily disabled
    // patchVerifyPayment: builder.mutation<
    //   GetBooking,
    //   { id: number; payload: PatchVerifyPaymentInput }
    // >({
    //   query: ({
    //     id,
    //     payload,
    //   }): { url: string; method: string; body: PatchVerifyPaymentInput } => ({
    //     url: `${bookingApiRoute}/${id}/owners/verify-payment`,
    //     method: "PATCH",
    //     body: payload,
    //   }),
    //   transformResponse: (response: ApiResponseType<GetBooking>) =>
    //     response.results ?? null,
    //   invalidatesTags: ["Booking"],
    // }),
    // cancelBooking: builder.mutation<
    //   GetBooking,
    //   { id: number; payload: CancelBookingInput }
    // >({
    //   query: ({
    //     id,
    //     payload,
    //   }): { url: string; method: string; body: CancelBookingInput } => ({
    //     url: `${bookingApiRoute}/${id}/cancel`,
    //     method: "POST",
    //     body: payload,
    //   }),
    //   transformResponse: (response: ApiResponseType<GetBooking>) =>
    //     response.results ?? null,
    //   invalidatesTags: ["Booking"],
    // }),

    // Paymongo integration
    //! temporary disabledd
    // createPaymongoCheckout: builder.mutation<
    //   {
    //     paymentId: number;
    //     clientKey: string;
    //     checkoutUrl: string;
    //   },
    //   { bookingId: number }
    // >({
    //   query: ({ bookingId }) => ({
    //     url: `${bookingApiRoute}/${bookingId}/paymongo`,
    //     method: "POST",
    //   }),
    //   transformResponse: (
    //     response: ApiResponseType<{
    //       paymentId: number;
    //       clientKey: string;
    //       checkoutUrl: string;
    //     }>,
    //   ) => response.results ?? null,
    //   invalidatesTags: ["Booking"],
    // }),

    //*newly implemented feature
    cancelBooking: builder.mutation<
      GetBooking,
      { id: number; payload: CancelBookingInput }
    >({
      query: ({ id, payload }) => ({
        url: `${bookingApiRoute}/${id}/cancel`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<GetBooking>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),

    requestExtension: builder.mutation<
      BookingExtensionRequest,
      { id: number; payload: RequestExtensionInput }
    >({
      query: ({ id, payload }) => ({
        url: `${bookingApiRoute}/${id}/extensions`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<BookingExtensionRequest>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),

    approveExtension: builder.mutation<
      ApproveExtensionResponse,
      { id: number; extensionId: number; payload: ApproveExtensionInput }
    >({
      query: ({ id, extensionId, payload }) => ({
        url: `${bookingApiRoute}/${id}/extensions/${extensionId}/approve`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (
        response: ApiResponseType<ApproveExtensionResponse>,
      ) => response.results ?? null,
      invalidatesTags: ["Booking"],
    }),

    rejectExtension: builder.mutation<
      BookingExtensionRequest,
      { id: number; extensionId: number; payload: RejectExtensionInput }
    >({
      query: ({ id, extensionId, payload }) => ({
        url: `${bookingApiRoute}/${id}/extensions/${extensionId}/reject`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: ApiResponseType<BookingExtensionRequest>) =>
        response.results ?? null,
      invalidatesTags: ["Booking"],
    }),

    //* temporary disabledd
    createBookingChargeCheckout: builder.mutation<
      BookingChargeCheckoutResponse,
      { bookingId: number }
    >({
      query: ({ bookingId }) => ({
        url: `${bookingApiRoute}/${bookingId}/payment/checkout`,
        method: "POST",
      }),
      transformResponse: (
        response: ApiResponseType<BookingChargeCheckoutResponse>,
      ) => response.results ?? null,
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetOneQuery,
  useGetActiveQuery,
  useGetBookingPaymentQuery,
  useGetBookingStatusQuery,
  useGetRefundPreviewQuery,
  useCreateBookingMutation,
  usePatchTenantBookingMutation,
  usePatchApproveBookingMutation,
  usePatchRejectBookingMutation,
  // usePatchVerifyPaymentMutation,
  // useCancelBookingMutation,
  // useCreatePaymongoCheckoutMutation,
  useCreateBookingChargeCheckoutMutation,
  useCancelBookingMutation,
  useRequestExtensionMutation,
  useApproveExtensionMutation,
  useRejectExtensionMutation,
} = bookingApi;
