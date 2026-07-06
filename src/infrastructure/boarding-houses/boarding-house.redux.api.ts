import {
  createApi,
  fetchBaseQuery,
  TagDescription,
} from "@reduxjs/toolkit/query/react";
import { ApiResponseType } from "../common/types/api.types";
import api from "@/application/config/api";
import {
  QueryBoardingHouse,
  QueryBoardingHouseSchema,
  FindOneBoardingHouseSchema,
  BoardingHouse,
  FindOneBoardingHouse,
  CreateBoardingHouseInput,
  GetBoardingHouse,
  PatchBoardingHouseInput,
  PatchBoardingHouseSchema,
} from "./boarding-house.schema";

import { uploadBoardingHouse } from "../utils/upload.service";
import { expoStorageCleaner } from "../utils/expo-utils/expo-utils.service";

//* -- createApi --
const boardingHouseApiRoute = `/api/boarding-houses`;
export const boardingHouseApi = createApi({
  tagTypes: ["BoardingHouse"],
  reducerPath: "boardingHouseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: api.BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
      if (endpoint === "create") {
        headers.delete("Content-Type");
      }
      return headers;
    },
    fetchFn: async (input, init) => {
      console.log("FETCHING URL:", input);
      console.log("FETCH INIT:", init);
      return fetch(input, init);
    },
  }),

  endpoints: (builder) => ({
    getAll: builder.query<GetBoardingHouse[], QueryBoardingHouse | undefined>({
      query: (params) => {
        const parsed = QueryBoardingHouseSchema.safeParse(params ?? {});
        if (!parsed.success) {
          console.error("Invalid query params", parsed.error.format());
          return boardingHouseApiRoute;
        }

        const queryParams = new URLSearchParams(
          Object.fromEntries(
            Object.entries(parsed.data)
              .filter(([_, v]) => v != null)
              .map(([key, value]) => [key, String(value)]),
          ),
        );

        return `${boardingHouseApiRoute}?${queryParams.toString()}`;
      },
      transformResponse: (response: ApiResponseType<GetBoardingHouse[]>) =>
        response.results ?? [],
      // transformResponse: (response: ApiResponseType<BoardingHouse>) =>
      //   z.array(BoardingHouseReadSchema).parse(response.results ?? []),
      providesTags: (
        result: GetBoardingHouse[] | undefined,
        error,
        arg,
      ): TagDescription<"BoardingHouse">[] => {
        const tags: TagDescription<"BoardingHouse">[] = [
          { type: "BoardingHouse", id: "LIST" },
        ];

        result?.forEach((bh) => {
          tags.push({ type: "BoardingHouse", id: bh.id });
        });

        return tags;
      },
    }),
    getOne: builder.query<FindOneBoardingHouse | null, number | null>({
      query: (id) => `${boardingHouseApiRoute}/${id}`,
      transformResponse: (response: ApiResponseType<FindOneBoardingHouse>) => {
        if (!response.results) return null;

        const res = response.results;
        return res;
      },
      providesTags: (result, error, id) =>
        id ? [{ type: "BoardingHouse", id }] : [],
    }),
    // TODO make a dto for one source of truth
    create: builder.mutation<ApiResponseType<any>, CreateBoardingHouseInput>({
      async queryFn(data) {
        try {
          const result = await uploadBoardingHouse(data);

          if (result.success) {
            await expoStorageCleaner("images");
            return {
              data: {
                success: true,
                results: result.data,
                timestamp: new Date().toISOString(),
              },
            };
          }

          return {
            error: {
              status: "SERVER_REJECTED",
              data: result.error,
              dataObj: result,
            },
          };
        } catch (error: any) {
          return {
            error: {
              status: "EXCEPTION",
              data: error?.message ?? "Unexpected error",
            } as any,
          };
        }
      },
      invalidatesTags: ["BoardingHouse"],
    }),

    patch: builder.mutation<
      ApiResponseType<BoardingHouse>,
      { id: number; data: PatchBoardingHouseInput }
    >({
      query: ({ id, data }) => {
        // Validate with Zod
        const parsed = PatchBoardingHouseSchema.safeParse(data);

        if (!parsed.success) {
          console.error("❌ Invalid PATCH data", parsed.error.format());
          throw new Error("Invalid PATCH data");
        }

        return {
          url: `${boardingHouseApiRoute}/${id}`,
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: parsed.data, // Only valid, filtered fields
        };
      },

      invalidatesTags: (result, error, { id }) => [
        { type: "BoardingHouse", id },
        { type: "BoardingHouse", id: "LIST" },
      ],
    }),

    delete: builder.mutation<BoardingHouse, number>({
      query: (id) => ({
        url: `${boardingHouseApiRoute}/${id}`,
        method: "DELETE",
      }),
      //* Optional: invalidates cache for "BoardingHouse"
      invalidatesTags: ["BoardingHouse"],
    }),
  }),
});
export const {
  useGetAllQuery,
  useGetOneQuery,
  useCreateMutation,
  usePatchMutation,
  useDeleteMutation,
} = boardingHouseApi;
