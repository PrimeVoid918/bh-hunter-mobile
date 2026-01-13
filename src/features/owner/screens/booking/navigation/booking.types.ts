export type OwnerBookingStackParamList = {
  PropertiesMainScreen: undefined;
  PropertiesBookingListsScreen: {
    bookId: number | null;
    [key: string]: any; // allow extra params if needed
  };
  PropertiesDetailsScreen: {
    bookId: number | null;
    [key: string]: any; // allow extra params if needed
  };
};

export const OwnerBookingStackParamListArrayName = [
  "BoardingHouseLists",
  "BoardingHouseDetails",
];
