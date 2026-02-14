import type { RouteProp } from "@react-navigation/native";

export type TenantBookingStackParamList = {
  BoardingHouseLists: undefined;
  BoardingHouseDetails: {
    id: number | null;
    fromMaps?: boolean;
    [key: string]: any; // allow extra params if needed
  };
  RoomsBookingListsScreen: {
    paramsId: number;
  };
  RoomsDetailsScreen: {
    boardingHouseId: number | undefined;
    roomId: number | undefined;
    ownerId: number | undefined;
    fromMaps?: boolean;
    [key: string]: any; // allow extra params if needed
  };
  RoomsCheckoutScreen: {
    ownerId: number | undefined;
    roomId: number | undefined;
  };
};

export type RoomsBookingScreenRouteProp = RouteProp<
  TenantBookingStackParamList,
  "RoomsBookingListsScreen"
>;

export const TenantBookingStackParamListArrayName = [
  "BoardingHouseLists",
  "BoardingHouseDetails",
  "RoomsBookingListsScreen",
  "RoomsDetailsScreen",
  "RoomsCheckoutScreen",
];
