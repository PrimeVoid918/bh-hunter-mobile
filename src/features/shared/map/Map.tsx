import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Image, ViewStyle } from "react-native";
import {
  MapView,
  Camera,
  UserLocation,
  PointAnnotation,
} from "@maplibre/maplibre-react-native";
import { View, Text } from "@gluestack-ui/themed";
import * as Location from "expo-location";
import { BoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";

const DEFAULT_COORDS: [number, number] = [124.6095, 11.0008519];

interface MapProps {
  data: BoardingHouse[];
  isBoardingHousesLoading?: boolean;
  handleMarkerPress: (house: BoardingHouse) => void;
  mapStyle?: ViewStyle;
  backdropStyle?: ViewStyle;
}

//TODO: use OSRM (Open Source Routing Machine)
/**
   * Package,Purpose,Why you need it
   *fetch (Built-in),API Requests,To call the OSRM servers. No extra install needed.
   *@turf/turf,Geospatial Logic,"To calculate the distance (e.g., ""1.2 km away"") or ""clean"" the coordinates OSRM gives you."
   *expo-location,User GPS,"If you don't have it yet, this gets the currentLocation for your user."
    <MapLibreGL.ShapeSource id="routeSource" shape={routeData} tolerance={0.5}>
    <MapLibreGL.LineLayer id="routeLine" style={{ lineCap: 'round', lineJoin: 'round' }} />
    </MapLibreGL.ShapeSource>
   */

export default function Map({
  data,
  isBoardingHousesLoading,
  handleMarkerPress,
  mapStyle,
  backdropStyle,
}: MapProps) {
  const [locationGranted, setLocationGranted] = useState(false);
  const [imageSize, setImageSize] = useState(25);
  const [cameraCoords, setCameraCoords] =
    useState<[number, number]>(DEFAULT_COORDS);

  // Request location once
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) =>
      setLocationGranted(status === "granted"),
    );
  }, []);

  // Optional marker animation
  const attempts = useRef(0);
  const maxAttempts = 5;
  useEffect(() => {
    if (attempts.current >= maxAttempts) return;
    const timer = setTimeout(() => {
      setImageSize((prev) => prev + 1);
      attempts.current += 1;
    }, 100);
    return () => clearTimeout(timer);
  }, [imageSize]);

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
          animationDuration={0}
        />
        {locationGranted && <UserLocation visible />}
        {!isBoardingHousesLoading &&
          data.map((house, i) => {
            const location = house.location;
            if (
              !location ||
              !location.coordinates ||
              location.coordinates.length !== 2
            )
              return null;

            const [lng, lat] = location.coordinates;
            console.log("long, lat", lng, lat);
            return (
              <PointAnnotation
                key={house.id ?? i}
                id={`marker-${i}`}
                coordinate={[lng, lat]}
                onSelected={() => handleMarkerPress(house)}
              >
                <Image
                  source={require("@/assets/static/green-marker.png")}
                  style={{ width: imageSize, height: 32 }}
                />
              </PointAnnotation>
            );
          })}
      </MapView>

      {backdropStyle && (
        <View pointerEvents="none" style={[styles.backdrop, backdropStyle]} />
      )}

      <View style={styles.attributionContainer}>
        <Text style={styles.attributionText}>
          © <Text style={{ color: "blue" }}>OpenStreetMap</Text> contributors
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  attributionContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 4,
    borderRadius: 4,
  },
  attributionText: { fontSize: 10 },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});
