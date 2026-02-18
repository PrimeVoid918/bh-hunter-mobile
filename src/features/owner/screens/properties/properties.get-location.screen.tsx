import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { VStack } from "@gluestack-ui/themed";
import {
  MapView,
  Camera,
  UserLocation,
  MarkerView,
} from "@maplibre/maplibre-react-native";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
  BorderRadius,
} from "@/constants";
import { usePropertyNavigation } from "./navigation/properties.navigation.hooks";
import { useRoute } from "@react-navigation/native";

const DEFAULT_COORDS: [number, number] = [124.6095, 11.0008519]; // [lng, lat]

export default function PropertiesGetLocationScreen() {
  const route = useRoute();
  const propertyNavigation = usePropertyNavigation();
  const { onSelect } = route.params || {};

  // const cameraRef = useRef<Camera>(null);

  const [location, setLocation] = useState<[number, number] | null>(null);

  const handleMapPress = (e: any) => {
    const [longitude, latitude] = e.geometry.coordinates;
    setLocation([longitude, latitude]);
  };

  const handleConfirmLocation = () => {
    if (location) {
      const [longitude, latitude] = location;
      onSelect?.({ latitude, longitude });
      propertyNavigation.goBack();
    }
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
    >
      <VStack style={{ flex: 1 }}>
        <MapView
          style={s.map}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          logoEnabled={false}
          attributionEnabled={true}
          onPress={handleMapPress}
        >
          <Camera
            // ref={cameraRef}
            defaultSettings={{
              centerCoordinate: DEFAULT_COORDS,
              zoomLevel: 14,
            }}
          />
          <UserLocation />
          {location && (
            <MarkerView coordinate={location}>
              <Image
                source={require("@/assets/static/green-marker.png")}
                style={{ width: 32, height: 32 }}
              />
            </MarkerView>
          )}
        </MapView>

        {location && (
          <View style={s.infoBox}>
            <Text>Latitude: {location[1].toFixed(5)}</Text>
            <Text>Longitude: {location[0].toFixed(5)}</Text>
            <Pressable onPress={handleConfirmLocation} style={s.button}>
              <Text >
                Set Location
              </Text>
            </Pressable>
          </View>
        )}
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  map: {
    flex: 1,
  },
  infoBox: {
    position: "absolute",
    bottom: 50,
    left: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: BorderRadius.md,
  },
});
