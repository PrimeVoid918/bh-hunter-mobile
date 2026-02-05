import React, { useEffect, useState } from "react";
import { StyleSheet, Image } from "react-native";
import {
  MapView,
  Camera,
  UserLocation,
  MarkerView,
  PointAnnotation,
} from "@maplibre/maplibre-react-native";
import { BoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import { Text, View } from "@gluestack-ui/themed";
import * as Location from "expo-location"; // ✅ import Location

const DEFAULT_COORDS: [number, number] = [124.6095, 11.0008519]; // [lng, lat]

interface MapProps {
  data: BoardingHouse[];
  isBoardingHousesLoading?: boolean;
  handleMarkerPress: (house: BoardingHouse) => void;
}

export default function Map({
  data,
  isBoardingHousesLoading,
  handleMarkerPress,
}: MapProps) {
  // Request location permission on mount
  const [locationGranted, setLocationGranted] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === "granted");
    };
    requestPermission();
  }, []);

  useEffect(() => {
    if (errorMsg) {
      console.log(errorMsg);
    }
  }, [errorMsg]);
  const [imageSize, setImageSize] = useState(25);
  const attempts = React.useRef(0);
  const maxAttempts = 5;

  useEffect(() => {
    if (attempts.current >= maxAttempts) return;

    const timer = setTimeout(() => {
      setImageSize((prev) => prev + 1);
      attempts.current += 1;
    }, 100);

    return () => clearTimeout(timer);
  }, [imageSize]); // ← Re-run when size changes

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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        logoEnabled={false}
        attributionEnabled={true}
      >
        {/* Center + zoom */}
        <Camera
          centerCoordinate={DEFAULT_COORDS}
          zoomLevel={14}
          animationDuration={0}
        />

        {locationGranted && <UserLocation visible={true} />}

        {/* Markers */}
        {!isBoardingHousesLoading &&
          (data ?? []).map((house: BoardingHouse, i) => {
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
                key={i}
                id={`marker-${i}`}
                coordinate={[lng, lat]}
                onSelected={() => handleMarkerPress?.(house)}
              >
                <View style={{}}>
                  <Image
                    source={require("@/assets/static/green-marker.png")}
                    style={{
                      width: imageSize,
                      height: 32,
                      backgroundColor: "transparent",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      // borderWidth: 1,
                      // borderColor: "gray",
                      flexShrink: 0, // important
                    }}
                  />
                  {/* <Text style={{ fontSize: 4 }}>{house.name}</Text> */}
                  {/* <Text style={{ fontSize: 12 }}>{house.description}</Text> */}
                  {/* <Text style={{ fontSize: 12 }}>{house.ownerId}</Text> */}
                  {/* <Text style={{ fontSize: 12 }}>{house.amenities}</Text> */}
                </View>
              </PointAnnotation>
            );
          })}
      </MapView>
      <View style={styles.attributionContainer}>
        <Text style={styles.attributionText}>
          ©{" "}
          <Text
            style={{ color: "blue" }}
            onPress={() =>
              Linking.openURL("https://www.openstreetmap.org/copyright")
            }
          >
            OpenStreetMap
          </Text>{" "}
          contributors
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: "red",
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "gray",
  },
  // markerText: {
  //   fontSize: 12,
  // },
  errorText: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    color: "red",
    fontSize: 14,
  },
  attributionContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 4,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
  },
});
