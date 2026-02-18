import { StyleSheet } from "react-native";
import { Colors } from "./themes/colors";
import { BorderWidth } from "./themes/border";

export const GlobalStyle = StyleSheet.create({
  GlobalsContainer: {
    flex: 1,
  },
  GlobalsContentContainer: {
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  GlobalsColor: {
  },

  fontColor: {
    // color: Colors.Text[2],
  },
  HeadingsFont: {
    fontFamily: "Baloo2",
  },
  BodyFont: {
    fontFamily: "QuickSand",
  },
  AlternativeFont: {
    fontFamily: "Fredoka",
  },
  GenericFont: {
    fontFamily: "Segoe UI",
  },
});

export const GlobalBottomNavigationStyles = {
  // containerBackgroundColor: Colors.PrimaryLight[6],
  // containerIconColor: Colors.PrimaryLight[6],
  // containerIconActiveColor: Colors.PrimaryLight[2],
  // containerIconInactiveColor: Colors.PrimaryLight[3],
  // containerIconContainerColor: Colors.PrimaryLight[6],
  // containerIconHeightFromBottom: 0,
  containerIconHeightFromBottom: 40,

  // containerIconHeight: 0,
  containerIconHeight: 60,

  iconBorderWidth: BorderWidth.xs,
  // iconBackgroundColor: Colors.PrimaryLight[7],
  // iconColorFocused: Colors.PrimaryLight[2],
  // iconColorNotFucused: Colors.PrimaryLight[5],
  iconHeight: 50,
  iconLiftHeightWhenFocused: -10,
  iconLiftHeightWhenNotFocused: 0,
  iconSize: 35,
};
