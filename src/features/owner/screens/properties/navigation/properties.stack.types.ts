interface LocationShapeInParams {
  latitude: number;
  longitude: number;
}

export type PropertiesStackParamList = {
  PropertiesHome: undefined;
  PropertyCreate: undefined;
  PropertyLocationPicker: { onSelect: (coords: LocationShapeInParams) => void };
  BoardingHouseDetailsScreen: {
    id: number | null;
    fromMaps?: boolean;
    [key: string]: any; // allow extra params if needed
  };
  RoomsListMainScreen: {
    paramsId: number;
  };
  RoomsDetailsScreen: {
    boardingHouseId: number | undefined;
    roomId: number | undefined;
    fromMaps?: boolean;
    [key: string]: any; // allow extra params if needed
  };
  RoomsAddScreen: {
    bhId: number;
  };
};

export const PropertiesStackParamListArrayName = [
  "PropertiesHome",
  "PropertyCreate",
  "PropertyLocationPicker",
];
