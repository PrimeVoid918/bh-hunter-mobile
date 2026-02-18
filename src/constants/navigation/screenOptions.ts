import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Colors, GlobalStyle } from "../index"; // or adjust the path based on your structure

export const backButtonConfig: NativeStackNavigationOptions = {
  headerShown: true,
  title: "",
  headerStyle: {
    backgroundColor: GlobalStyle.GlobalsContainer.backgroundColor,
  },
  // headerTintColor: Colors.PrimaryLight[1],
};
