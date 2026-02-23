import { BorderRadius } from "@/constants";
import { MD3LightTheme, configureFonts, MD3Colors } from "react-native-paper";

interface CustomColors extends MD3Colors {
  textInverse: string;
  success: string;
  warning: string;
  info: string;
}

const fontConfig = {
  default: {
    regular: {
      fontFamily: "Poppins-Regular",
      fontWeight: "400",
    },
    medium: {
      fontFamily: "Poppins-Medium",
      fontWeight: "500",
    },
    light: {
      fontFamily: "Poppins-Light",
      fontWeight: "300",
    },
    thin: {
      fontFamily: "Poppins-Thin",
      fontWeight: "100",
    },
  },
};

const theme = {
  ...MD3LightTheme,
  // roundness: BorderRadius.md, // <- This actually reaches the MD3 button
  roundness: 2,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#357FC1",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D6ECFA",
    onPrimaryContainer: "#123969",

    secondary: "#FDD85D",
    onSecondary: "#3A3A3A",

    background: "#F7F9FC",
    surface: "#FFFFFF",
    onSurface: "#1A1A1A",
    surfaceVariant: "#F0F0F5",

    error: "#D64545",
    success: "#80CFA9",
    warning: "#F78C6B",
    info: "#9B51E0",

    outline: "#767474",
    outlineVariant: "#CCCCCC",
    disabled: "#CCCCCC",
    overlay: "rgba(0,0,0,0.3)",

    text: "#1A1A1A",
    placeholder: "#9A9A9A",
    textInverse: "#FFFFFF",
  },
  fonts: configureFonts(fontConfig),
};

export default theme;
