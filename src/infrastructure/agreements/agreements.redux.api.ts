import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponseType } from "../common/types/api.types";
import {
  AgreementPdfPayload,
  AgreementPreview,
  AgreementReviewInfo,
  BookingAgreementSummary,
} from "./agreements.schema";

const agreementApiRoute = "api/agreements";

type AgreementPreviewParams = {
  roomId: number;
  tenantId: number;
  occupantsCount: number;
  checkInDate: string;
  checkOutDate: string;
};

export const agreementApi = createApi({
  reducerPath: "agreementApi",
  tagTypes: ["Agreement"],
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    fetchFn: async (input, init) => fetch(input, init),
  }),

  endpoints: (builder) => ({
    getAgreementPreview: builder.query<
      AgreementPreview | null,
      AgreementPreviewParams
    >({
      query: ({
        roomId,
        tenantId,
        occupantsCount,
        checkInDate,
        checkOutDate,
      }) => {
        const queryParams = new URLSearchParams({
          roomId: String(roomId),
          tenantId: String(tenantId),
          occupantsCount: String(occupantsCount),
          checkInDate,
          checkOutDate,
        });

        return `${agreementApiRoute}/preview?${queryParams.toString()}`;
      },
      transformResponse: (response: ApiResponseType<AgreementPreview>) =>
        response.results ?? null,
      providesTags: ["Agreement"],
    }),

    getAgreementReviewInfo: builder.query<AgreementReviewInfo | null, number>({
      query: (bookingId) => `${agreementApiRoute}/bookings/${bookingId}/review`,
      transformResponse: (response: ApiResponseType<AgreementReviewInfo>) =>
        response.results ?? null,
      providesTags: ["Agreement"],
    }),
    getAgreementByBooking: builder.query<
      BookingAgreementSummary | null,
      number
    >({
      query: (bookingId) => `${agreementApiRoute}/bookings/${bookingId}`,
      transformResponse: (response: ApiResponseType<BookingAgreementSummary>) =>
        response.results ?? null,
      providesTags: ["Agreement"],
    }),

    getAgreementPdfPayload: builder.mutation<
      AgreementPdfPayload | null,
      number
    >({
      query: (bookingId) => ({
        url: `${agreementApiRoute}/bookings/${bookingId}/pdf-payload`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponseType<AgreementPdfPayload>) =>
        response.results ?? null,
      invalidatesTags: ["Agreement"],
    }),

    markAgreementPdfGenerated: builder.mutation<
      BookingAgreementSummary | null,
      { bookingId: number; pdfUrl: string }
    >({
      query: ({ bookingId, pdfUrl }) => ({
        url: `${agreementApiRoute}/bookings/${bookingId}/pdf`,
        method: "PATCH",
        body: { pdfUrl },
      }),
      transformResponse: (response: ApiResponseType<BookingAgreementSummary>) =>
        response.results ?? null,
      invalidatesTags: ["Agreement"],
    }),
  }),
});

export const {
  useGetAgreementPreviewQuery,
  useGetAgreementByBookingQuery,
  useGetAgreementReviewInfoQuery,
  useGetAgreementPdfPayloadMutation,
  useMarkAgreementPdfGeneratedMutation,
} = agreementApi;
