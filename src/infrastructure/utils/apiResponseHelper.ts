// utils/apiResponseHelper.ts
import { ApiResponseType } from "@/infrastructure/common/types/api.types";

export function normalizeRoomsResponse<
  T extends { thumbnail?: any[]; gallery?: any[] },
>(response: ApiResponseType<T[] | Record<string, T>>): T[] {
  const { results } = response;
  if (!results) return [];

  // If results is already an array
  if (Array.isArray(results)) return results;

  // If numeric-keyed object, convert to array and preserve images
  return Object.keys(results)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => {
      const room = (results as Record<string, T>)[key];
      return {
        ...room,
        thumbnail: room.thumbnail ?? [],
        gallery: room.gallery ?? [],
      };
    });
}

export function normalizeRoomResponse<
  T extends { thumbnail?: any[]; gallery?: any[] },
>(response: ApiResponseType<T | Record<string, T>>): T | null {
  const { results } = response;
  if (!results) return null;

  // If results is already a single object (not numeric keys)
  if (
    !Array.isArray(results) &&
    !Object.keys(results).every((k) => !isNaN(Number(k)))
  ) {
    return {
      ...results,
      thumbnail: results.thumbnail ?? [],
      gallery: results.gallery ?? [],
    } as T;
  }

  // If numeric-keyed object, take first numeric key
  const firstKey = Object.keys(results).find((key) => !isNaN(Number(key)));
  if (!firstKey) return null;

  const room = (results as Record<string, T>)[firstKey];
  return {
    ...room,
    thumbnail: room.thumbnail ?? [],
    gallery: room.gallery ?? [],
  };
}
