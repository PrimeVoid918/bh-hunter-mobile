import React, { useEffect, useState } from "react";
import { StyleSheet, Image, ViewStyle, View, Text } from "react-native";
import {
  MapView,
  Camera,
  UserLocation,
  PointAnnotation,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { Surface } from "react-native-paper";

// Infrastructure & Config
import { BoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import { MapMarker } from "@/infrastructure/map/map.types";
import { DEFAULT_COORDS } from "@/application/config/map.config";
import theme from "@/application/config/react-native-paper.config";
import { BorderRadius, Spacing } from "@/constants";

interface MapProps {
  data: MapMarker[];
  defaultCoordinates?: [number, number];
  isMarkersLoading?: boolean;
  handleMarkerPress: (house: BoardingHouse) => void;
  mapStyle?: ViewStyle;
  backdropStyle?: ViewStyle;
}

export default function Map({
  data,
  defaultCoordinates = [DEFAULT_COORDS.lng, DEFAULT_COORDS.lat],
  isMarkersLoading,
  handleMarkerPress,
  mapStyle,
  backdropStyle,
}: MapProps) {
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraCoords] = useState<[number, number]>(defaultCoordinates);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) =>
      setLocationGranted(status === "granted"),
    );
  }, []);

  return (
    <View style={[styles.container, mapStyle]}>
      <MapView
        style={styles.map}
        logoEnabled={false}
        attributionEnabled={true}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >
        <Camera
          centerCoordinate={cameraCoords}
          zoomLevel={14}
          animationMode="flyTo"
        />

        {locationGranted && <UserLocation visible />}

        {!isMarkersLoading &&
          data?.map((marker) => {
            const lng = Number(marker.lng);
            const lat = Number(marker.lat);

            // Logic for Green/Red status
            const statusColor = marker.availabilityStatus
              ? theme.colors.success
              : theme.colors.error;

            if (isNaN(lng) || isNaN(lat)) return null;

            return (
              <PointAnnotation
                key={`marker-${marker.id}`}
                id={`marker-${marker.id}`}
                coordinate={[lng, lat]}
                onSelected={() => handleMarkerPress(marker as any)}
                anchor={{ x: 0.5, y: 1 }}
              >
                {/* Custom Marker View */}
                <View style={styles.markerContainer}>
                  <Surface
                    style={[
                      styles.markerChip,
                      { backgroundColor: statusColor },
                    ]}
                    elevation={2}
                  >
                    <Text style={styles.markerText}>
                      ₱{marker.price}
                      {!marker.availabilityStatus && " • Full"}
                    </Text>
                  </Surface>
                  {/* The Pointer Tip */}
                  <View
                    style={[
                      styles.markerPointer,
                      { borderTopColor: statusColor },
                    ]}
                  />
                </View>
              </PointAnnotation>
            );
          })}
      </MapView>

      {backdropStyle && (
        <View pointerEvents="none" style={[styles.backdrop, backdropStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10, // Gives room for the pointer
  },
  markerChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20, // Modern Pill Shape
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  markerText: {
    color: "white",
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    fontWeight: "600",
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1, // Prevent gap between chip and pointer
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    zIndex: 5,
  },
});
