import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MenuStackParamList } from "@/features/shared/menu/navigation/menu.stack.types";
import { OwnerBookingStackParamList } from "../screens/booking/navigation/booking.types";
import { PropertiesStackParamList } from "../screens/properties/navigation/properties.stack.types";

export type OwnerTabsParamList = {
  Properties: {
    screen: keyof PropertiesStackParamList;
    params?: PropertiesStackParamList[keyof PropertiesStackParamList];
  };
  Booking: {
    screen: keyof OwnerBookingStackParamList;
    params?: OwnerBookingStackParamList[keyof OwnerBookingStackParamList];
  };
  Dashboard: undefined;
  Notification: undefined;
  Menu: NativeStackNavigationProp<MenuStackParamList>;
};
