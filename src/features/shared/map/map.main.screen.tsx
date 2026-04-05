import React, { useState, useRef, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import { TenantTabsParamList } from "../../tenant/navigation/tenant.tabs.types";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useGetAllQuery } from "@/infrastructure/map/map.redux.api";

import { DEFAULT_COORDS } from "@/application/config/map.config";
import { BoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import Map from "./Map";
import ReloadFAB from "./ReloadFab";
import { MapSheet } from "./MuiMapSheet";
import { useSelector } from "react-redux";
import { RootState } from "@/application/store/stores";
export default function MapMainScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<BottomTabNavigationProp<TenantTabsParamList>>();
  const [sheetData, setDataSheet] = useState<BoardingHouse | null>(null);

  const {
    data: markers = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAllQuery({
    lat: DEFAULT_COORDS.lat,
    lng: DEFAULT_COORDS.lng,
    radius: 5000,
  });

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

  // const access = useSelector((state: RootState) => state.tenantAccess.status);

  // if (!access?.verified) {
  //   return <VerificationRequired />;
  // }

  return (
    <View style={{ flex: 1 }}>
      <StaticScreenWrapper
        style={{ flex: 1 }}
        refreshing={isFetching}
        loading={isLoading}
        error={[isError ? "Map service unavailable" : null]}
        variant="layout"
      >
        <Map
          mapStyle={styles.map}
          data={markers}
          isMarkersLoading={isLoading}
          handleMarkerPress={handleMarkerPress}
        />
        <ReloadFAB loading={isFetching} onPress={refetch} />
      </StaticScreenWrapper>

      {/* REPLACED: React Native Paper M3 "Sheet" */}
      <MapSheet
        visible={!!sheetData}
        data={sheetData}
        onClose={() => setDataSheet(null)}
        onNavigate={handleNavigateDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, overflow: "hidden" },
  map: { flex: 1 },
});
