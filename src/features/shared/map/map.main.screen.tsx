import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import * as Location from "expo-location";

import { TenantTabsParamList } from "../../tenant/navigation/tenant.tabs.types";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useGetAllQuery } from "@/infrastructure/map/map.redux.api";

import { DEFAULT_COORDS } from "@/application/config/map.config";
import { BoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import Map from "./Map";
import ReloadFAB from "./ReloadFab";
import { MapSheet } from "./MuiMapSheet";

type MapCoords = {
  lat: number;
  lng: number;
};

type LocationMode = "checking" | "granted" | "denied" | "fallback";

export default function MapMainScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<BottomTabNavigationProp<TenantTabsParamList>>();

  const [sheetData, setDataSheet] = useState<BoardingHouse | null>(null);

  const [mapCoords, setMapCoords] = useState<MapCoords>({
    lat: DEFAULT_COORDS.lat,
    lng: DEFAULT_COORDS.lng,
  });

  const [locationMode, setLocationMode] = useState<LocationMode>("checking");

  const usingUserLocation = locationMode === "granted";

  const {
    data: markers = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAllQuery({
    lat: mapCoords.lat,
    lng: mapCoords.lng,
    radius: 5000,
  });

  const loadUserLocation = useCallback(async () => {
    try {
      setLocationMode("checking");

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setLocationMode("denied");
        setMapCoords({
          lat: DEFAULT_COORDS.lat,
          lng: DEFAULT_COORDS.lng,
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setMapCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      setLocationMode("granted");
    } catch (error) {
      console.log("Map location error:", error);

      setLocationMode("fallback");
      setMapCoords({
        lat: DEFAULT_COORDS.lat,
        lng: DEFAULT_COORDS.lng,
      });
    }
  }, []);

  useEffect(() => {
    loadUserLocation();
  }, [loadUserLocation]);

  const handleMarkerPress = useCallback((marker: any) => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setDataSheet(marker as BoardingHouse);
  }, []);

  const handleNavigateDetail = () => {
    if (!sheetData) return;

    setDataSheet(null);

    navigation.navigate("Booking", {
      screen: "BoardingHouseDetails",
      params: { id: sheetData.id, fromMaps: true },
    });
  };

  const handleReload = async () => {
    await loadUserLocation();
    refetch();
  };

  const locationNotice =
    locationMode === "granted"
      ? "Showing nearby boarding houses based on your current location."
      : locationMode === "checking"
        ? "Checking your location to calculate nearby distance..."
        : "Turn on location to see distance from your current position. Showing results near Ormoc center for now.";

  return (
    <View style={{ flex: 1 }}>
      <StaticScreenWrapper
        style={{ flex: 1 }}
        refreshing={isFetching}
        loading={isLoading && markers.length === 0}
        error={[isError ? "Map service unavailable" : null]}
        variant="layout"
      >
        <Map
          mapStyle={styles.map}
          data={markers}
          defaultCoordinates={[mapCoords.lng, mapCoords.lat]}
          userLocationGranted={usingUserLocation}
          isMarkersLoading={isLoading}
          handleMarkerPress={handleMarkerPress}
        />

        <View
          pointerEvents="none"
          style={[
            styles.locationNotice,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {locationNotice}
          </Text>
        </View>

        <ReloadFAB loading={isFetching} onPress={handleReload} />
      </StaticScreenWrapper>

      <MapSheet
        visible={!!sheetData}
        data={sheetData}
        usingUserLocation={usingUserLocation}
        onClose={() => setDataSheet(null)}
        onNavigate={handleNavigateDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, overflow: "hidden" },
  map: { flex: 1 },
  locationNotice: {
    position: "absolute",
    top: 14,
    left: 16,
    right: 16,
    zIndex: 20,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
});
