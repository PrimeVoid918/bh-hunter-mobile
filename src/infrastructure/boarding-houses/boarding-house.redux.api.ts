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
      // Only remove Content-Type for FormData endpoints
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
          return boardingHouseApiRoute; // fallback without query
        }

        const queryParams = new URLSearchParams(
          Object.fromEntries(
            Object.entries(parsed.data)
              .filter(([_, v]) => v != null)
              .map(([key, value]) => [key, String(value)]) // <-- cast to string
          )
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
        arg
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

        // Use Zod to validate / parse the single result
        // return FindOneBoardingHouseSchema.parse(response.results[0]);
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

          // ❌ Backend returned success=false (e.g. validation or DB error)
          return {
            error: {
              status: "SERVER_REJECTED",
              data: result.error,
              dataObj: result,
            },
          };
        } catch (error: any) {
          // ❌ Catch runtime or unhandled issues
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

    // create: builder.mutation<any, CreateBoardingHouseInput>({
    //   query: (data) => {
    //     const formData = new FormData();

    //     // --- Basic fields ---
    //     formData.append("ownerId", String(data.ownerId));
    //     formData.append("name", data.name);
    //     formData.append("address", data.address);
    //     formData.append("description", data.description || "");
    //     formData.append(
    //       "availabilityStatus",
    //       data.availabilityStatus ? "true" : "false"
    //     );

    //     // --- Arrays / complex objects ---
    //     formData.append("amenities", JSON.stringify(data.amenities ?? []));
    //     formData.append("location", JSON.stringify(data.location ?? {}));

    //     // --- Normalize numeric/boolean fields in rooms ---
    //     const normalizedRooms = (data.rooms ?? []).map(
    //       ({ gallery, ...rest }) => ({
    //         ...rest,
    //         maxCapacity: Number(rest.maxCapacity ?? 0),
    //         price: Number(rest.price ?? 0),
    //       })
    //     );

    //     formData.append("rooms", JSON.stringify(normalizedRooms));

    //     // --- Thumbnail (1 file) ---
    //     if (data.thumbnail?.[0]) {
    //       const file = data.thumbnail[0];
    //       if (file.uri) {
    //         const cleanUri = file.uri.startsWith("file://")
    //           ? file.uri
    //           : `file://${file.uri}`;
    //         const fileType = file.type ?? "image/jpeg";
    //         const fileName =
    //           file.name ?? `thumbnail.${fileType.split("/")[1] ?? "jpg"}`;

    //         formData.append("thumbnail", {
    //           uri: cleanUri,
    //           name: fileName,
    //           type: fileType.toLowerCase(),
    //         } as any);
    //       }
    //     }

    //     // --- Gallery (multiple files) ---
    //     data.gallery?.forEach((file, i) => {
    //       if (file?.uri) {
    //         const cleanUri = file.uri.startsWith("file://")
    //           ? file.uri
    //           : `file://${file.uri}`;
    //         const uriParts = cleanUri.split(".");
    //         const ext = uriParts[uriParts.length - 1].toLowerCase();

    //         // Always use a valid MIME and lowercase it
    //         const fileType =
    //           file.type?.toLowerCase() ??
    //           `image/${ext === "jpg" ? "jpeg" : ext}`;
    //         const fileName = file.name ?? `gallery-${i}.${ext}`;

    //         formData.append("gallery", {
    //           uri: cleanUri,
    //           name: fileName,
    //           type: fileType,
    //         } as any);
    //       }
    //     });

    //     // --- Per-room gallery ---
    //     data.rooms?.forEach((room, index) => {
    //       room.gallery?.forEach((file, j) => {
    //         if (file?.uri) {
    //           const cleanUri = file.uri.startsWith("file://")
    //             ? file.uri
    //             : `file://${file.uri}`;
    //           const uriParts = cleanUri.split(".");
    //           const ext = uriParts[uriParts.length - 1].toLowerCase();

    //           const fileType =
    //             file.type?.toLowerCase() ??
    //             `image/${ext === "jpg" ? "jpeg" : ext}`;
    //           const fileName = file.name ?? `room-${index}-${j}.${ext}`;

    //           formData.append(`roomGallery${index}_${j}`, {
    //             uri: cleanUri,
    //             name: fileName,
    //             type: fileType,
    //           } as any);
    //         }
    //       });
    //     });

    //     // 🔍 Debug logs
    //     console.log("🧾 FORMDATA CONTENTS:");
    //     (formData as any)._parts?.forEach?.(([key, value]: any) => {
    //       if (typeof value === "object" && value.uri) {
    //         console.log(` → ${key}: ${value.uri}`);
    //       } else {
    //         console.log(` → ${key}: ${value}`);
    //       }
    //     });

    //     let totalFiles = 0;
    //     data.thumbnail?.length && (totalFiles += data.thumbnail.length);
    //     data.gallery?.length && (totalFiles += data.gallery.length);
    //     data.rooms?.forEach((r) => (totalFiles += r.gallery?.length ?? 0));
    //     console.log("🧩 Total files being uploaded:", totalFiles);

    //     return {
    //       url: "/api/boarding-houses",
    //       method: "POST",
    //       // ❌ DO NOT set Content-Type manually
    //       // fetchBaseQuery will detect FormData automatically
    //       body: formData,
    //     };
    //   },
    // }),
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

      // ensure UI updates after patch
      invalidatesTags: (result, error, { id }) => [
        { type: "BoardingHouse", id },
        { type: "BoardingHouse", id: "LIST" }, // optional: refresh list too
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
