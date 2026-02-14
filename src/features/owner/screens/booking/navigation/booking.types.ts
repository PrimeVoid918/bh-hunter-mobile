export type OwnerBookingStackParamList = {
  PropertiesMainScreen: undefined;
  PropertiesBookingListsScreen: {
    bhId: number | null;
    [key: string]: any; // allow extra params if needed
  };
  PropertiesDetailsScreen: {
    bookId: number | null;
    [key: string]: any; // allow extra params if needed
  };

  BookingStatusScreen: {
    bookId: number;
  };
};

export const OwnerBookingStackParamListArrayName = [
  "BoardingHouseLists",
  "BoardingHouseDetails",
];
