import { StyleSheet } from "react-native";
import { Colors } from "./themes/colors";
import { BorderWidth } from "./themes/border";
import { Spacing } from "./themes/spacing";

export const GlobalStyle = StyleSheet.create({
  GlobalsContainer: {
    flex: 1,
    backgroundColor: Colors.whiteToBlack[0],
    // gap: Spacing.md,
  },
  GlobalsContentContainer: {
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  GlobalsColor: {},

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
  containerBackgroundColor: Colors.whiteToBlack[0],
  containerIconColor: Colors.whiteToBlack[7],
  containerIconActiveColor: Colors.whiteToBlack[2],
  containerIconInactiveColor: Colors.whiteToBlack[4],
  containerIconContainerColor: Colors.whiteToBlack[8],
  containerIconHeightFromBottom: 0,
  // containerIconHeightFromBottom: 40,

  // containerIconHeight: 0,
  containerIconHeight: 60,

  iconBorderWidth: BorderWidth.xs,
  iconBackgroundColor: Colors.PrimaryLight[6],
  iconColorFocused: Colors.whiteToBlack[2],
  iconColorNotFucused: Colors.whiteToBlack[6],
  iconHeight: 50,
  iconLiftHeightWhenFocused: -10,
  iconLiftHeightWhenNotFocused: 0,
  iconSize: 35,
};
