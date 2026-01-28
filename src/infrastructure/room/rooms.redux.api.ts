import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import api from "@/application/config/api";
import { ApiResponseType } from "../common/types/api.types";
import {
  CreateRoom,
  FindOneRoom,
  GetRoom,
  PatchRoomInput,
  PatchRoomInputSchema,
} from "./rooms.schema";
import {
  normalizeRoomResponse,
  normalizeRoomsResponse,
} from "../utils/apiResponseHelper";

const roomApiRoute = `/api/boarding-houses/`;
export const roomApi = createApi({
  tagTypes: ["Room"],
  reducerPath: "roomApi",
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
    getAll: builder.query<GetRoom[], number>({
      query: (id) => `${roomApiRoute}${id}/rooms`,
      transformResponse: (response: ApiResponseType<Record<string, GetRoom>>) =>
        normalizeRoomsResponse(response),
      providesTags: (result) =>
        result
          ? [
              { type: "Room", id: "LIST" },
              ...result.map((room) => ({ type: "Room" as const, id: room.id })),
            ]
          : [{ type: "Room", id: "LIST" }],
    }),

    getOne: builder.query<
      FindOneRoom | null,
      { boardingHouseId: number; roomId: number }
    >({
      query: ({ boardingHouseId, roomId }) => ({
        url: `${roomApiRoute}${boardingHouseId}/rooms/${roomId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponseType<FindOneRoom>) =>
        normalizeRoomResponse(response),
      providesTags: (result, _error, { roomId }) =>
        result ? [{ type: "Room", id: roomId }] : [],
    }),

    create: builder.mutation<
      CreateRoom,
      { boardingHouseId: number | string; data: Partial<CreateRoom>[] }
    >({
      query: ({ boardingHouseId, data }) => ({
        url: `${roomApiRoute}${boardingHouseId}/rooms`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { roomId }) => [
        { type: "Room", id: roomId },
        { type: "Room", id: "LIST" },
      ],
    }),

    patchRoom: builder.mutation<
      ApiResponseType<GetRoom>,
      {
        boardingHouseId: number | string;
        roomId: number | string;
        data: PatchRoomInput;
      }
    >({
      query: ({ boardingHouseId, roomId, data }) => {
        const parsed = PatchRoomInputSchema.safeParse(data);
        if (!parsed.success) throw new Error("Invalid PATCH data");

        const body: any = { ...parsed.data };

        // Convert numeric fields to string for backend
        if (body.maxCapacity !== undefined)
          body.maxCapacity = String(body.maxCapacity);
        if (body.price !== undefined) body.price = String(body.price);

        // Only send defined fields → true PATCH
        const dataToSend = Object.fromEntries(
          Object.entries(body).filter(([_, v]) => v !== undefined),
        );

        console.log("dataToSend", dataToSend);

        return {
          url: `${roomApiRoute}${boardingHouseId}/rooms/${roomId}`,
          method: "PATCH",
          body: dataToSend,
        };
      },

      invalidatesTags: (_result, _error, { roomId }) => [
        { type: "Room", id: roomId },
        { type: "Room", id: "LIST" },
      ],
    }),

    delete: builder.mutation<
      GetRoom,
      { boardingHouseId: number; roomId: number }
    >({
      query: ({ boardingHouseId, roomId }) => ({
        url: `${roomApiRoute}${boardingHouseId}/rooms/${roomId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { roomId }) => [
        { type: "Room", id: roomId },
        { type: "Room", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetOneQuery,
  useCreateMutation,
  usePatchRoomMutation,
  useDeleteMutation,
} = roomApi;
