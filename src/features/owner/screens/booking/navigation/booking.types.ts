export type OwnerBookingStackParamList = {
  BookingMainScreen: undefined;
  BookingListsScreen: {
    bhId: number | null;
    [key: string]: any; // allow extra params if needed
  };
  BookingDetailsScreen: {
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
