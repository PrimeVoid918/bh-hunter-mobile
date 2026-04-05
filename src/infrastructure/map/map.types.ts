import { z } from "zod";

// Marker schema
export const mapMarkerSchema = z.object({
  id: z.number(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  availabilityStatus: z.boolean(),
  thumbnail: z.string().nullable(),
  price: z.string().nullable(),
  distance: z.number().optional(),
});

export type MapMarker = z.infer<typeof mapMarkerSchema>;
export type MapMarkersArray = MapMarker[];

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().optional().default(1000),
});
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;

export const boundsQuerySchema = z.object({
  minLat: z.coerce.number(),
  maxLat: z.coerce.number(),
  minLng: z.coerce.number(),
  maxLng: z.coerce.number(),
});
export type BoundsQuery = z.infer<typeof boundsQuerySchema>;
export const BoundsQuerySchema = z.object({
  minLat: z.coerce.number(),
  maxLat: z.coerce.number(),
  minLng: z.coerce.number(),
  maxLng: z.coerce.number(),
});
