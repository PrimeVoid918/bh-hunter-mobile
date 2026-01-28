import api from "@/application/config/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bHAndRoomShareApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: api.BASE_URL }),
  tagTypes: ["BoardingHouse", "Room"],
  endpoints: () => ({}),
});
