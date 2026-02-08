import { View, Text, StyleSheet, Image } from "react-native";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { HStack, Spinner, VStack } from "@gluestack-ui/themed";

import {
  Colors,
  GlobalStyle,
  Fontsize,
  Spacing,
  BorderRadius,
} from "@/constants";

//navigation
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { TenantTabsParamList } from "../../tenant/navigation/tenant.tabs.types";

// ui component
import HeaderSearch from "../../../components/layout/HeaderSearch";
import Button from "@/components/ui/Button";

// ui lib
import BottomSheet from "@gorhom/bottom-sheet";

//types
import { ScrollView } from "react-native-gesture-handler";

// redux
import { useGetAllQuery as useGetAllBoardingHouses } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { useDispatch } from "react-redux";
import {
  GetBoardingHouse,
  BoardingHouse,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import Map from "./Map";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import PressableImageFullscreen from "../../../components/ui/ImageComponentUtilities/PressableImageFullscreen";

export default function MapMainScreen() {
  const [search, setSearch] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "70%"], []);
  const [sheetData, setDataSheet] = useState<BoardingHouse | null>(null);
  const mapRef = useRef<{ moveCamera: (lng: number, lat: number) => void }>(
    null,
  );
  // const [sheetThumbnail, setSheetThumbnail] = useState<BoardingHouseImage | null>(null)

  const dispatch = useDispatch();

  const {
    data: boardinghouses,
    isLoading: isBoardingHousesLoading,
    isError: isBoardingHousesError,
  } = useGetAllBoardingHouses({});

  const navigation =
    useNavigation<BottomTabNavigationProp<TenantTabsParamList>>();

  const onChangeInputValue = (text: string) => {
    setSearch(text);
  };

  const handleMarkerPress = (data: BoardingHouse) => {
    console.log("pressed");
    if (sheetData?.id === data.id) return;
    setDataSheet(data);

    bottomSheetRef.current?.expand();
  };

  const handleGotoPress = () => {
    if (!sheetData) return;
    // dispatch(selectBoardinHouse(sheetData));
    console.log("handleGotoPress id ", sheetData.id);
    navigation.navigate("Booking", {
      screen: "BoardingHouseDetails",
      params: { id: sheetData.id, fromMaps: true },
    });
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.con_main]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
    >
      {isBoardingHousesLoading && <FullScreenLoaderAnimated />}
      {/* <HeaderSearch
        containerStyle={s.search_headerContainer}
        placeholder="Search"
        value={search}
        setValue={onChangeInputValue}
      /> */}
      <Map
        data={boardinghouses}
        isBoardingHousesLoading={isBoardingHousesLoading}
        handleMarkerPress={handleMarkerPress}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setDataSheet(null)} // 👈 reset
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: Colors.PrimaryLight[8] }}
        style={
          {
            // zIndex: 20,
          }
        }
      >
        {sheetData && (
          <View
            style={{
              // padding: Global,
              backgroundColor: Colors.PrimaryLight[8],
              flex: 1,
              alignItems: "flex-start",
            }}
          >
            <PressableImageFullscreen
              image={sheetData?.thumbnail?.[0]}
              imageStyleConfig={{
                resizeMode: "cover",
                containerStyle: { borderRadius: BorderRadius.md },
              }}
              containerStyle={{
                margin: "auto",
                width: "98%",
                height: 200,
                borderRadius: BorderRadius.md,
              }}
            ></PressableImageFullscreen>
            <View
              style={{
                marginTop: Spacing.sm,
                alignItems: "baseline",
                padding: Spacing.md,
                flexDirection: "column",
              }}
            >
              <View
                style={{
                  height: 300,
                  marginBottom: Spacing.sm,
                }}
              >
                <HStack
                  style={{
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    gap: 10,
                    backgroundColor: Colors.PrimaryLight[7],
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <VStack style={{ width: "75%" }}>
                    <Text style={[s.text_title]}>{sheetData.name}</Text>
                    <Text style={[s.text_address]}>{sheetData.address}</Text>
                  </VStack>
                  <Button
                    title="Goto?"
                    onPressAction={handleGotoPress}
                    containerStyle={{
                      padding: 10,
                    }}
                  />
                </HStack>
                <ScrollView
                  style={{
                    marginTop: Spacing.md,
                    flex: 1,
                    // borderColor: "red",
                    // borderWidth: 1,
                    padding: 10,
                    borderRadius: BorderRadius.md,
                    backgroundColor: Colors.PrimaryLight[7],
                  }}
                >
                  <Text style={[s.text_white, { marginBottom: 20 }]}>
                    {sheetData.description}
                  </Text>
                </ScrollView>
              </View>
            </View>
          </View>
        )}
      </BottomSheet>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  con_main: {},
  map: {
    // ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  search_headerContainer: {
    position: "absolute",
    width: "90%",
    height: 50,
    backgroundColor: Colors.PrimaryLight[7],
    top: "5%",
    left: "5%",
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 5,

    zIndex: 10,
  },
  search_headerText: {
    // backgroundColor: "red",
    fontSize: Fontsize.lg,
    color: Colors.PrimaryLight[8],
  },
  callout: {
    padding: 10,
  },
  text_white: {
    color: "white",
  },
  text_address: {
    fontSize: Fontsize.sm,
    paddingTop: 5,
    color: Colors.TextInverse[2],

    // borderColor: "red",
    // borderWidth: 3,
  },
  text_title: {
    // borderColor: "red",
    // borderWidth: 3,
    color: Colors.TextInverse[1],
    fontSize: Fontsize.xxl,
    fontWeight: 900,
  },
});
